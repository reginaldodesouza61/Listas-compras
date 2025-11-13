"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  arrayUnion,
  getDocs,
} from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-context"

export interface ShoppingList {
  id: string
  name: string
  description?: string
  ownerId: string
  members: string[]
  memberEmails: { [key: string]: string }
  shareCode: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ShoppingItem {
  id: string
  listId: string
  name: string
  quantity?: number
  unitPrice?: number
  note?: string
  completed: boolean
  addedBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function useShoppingLists() {
  const { user } = useAuth()
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLists([])
      setLoading(false)
      return
    }

    // Instead, we'll sort on the client side after receiving data
    const q = query(collection(db, "lists"), where("members", "array-contains", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ShoppingList[]

      listsData.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())

      setLists(listsData)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const createList = async (name: string, description?: string) => {
    if (!user) return

    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    await addDoc(collection(db, "lists"), {
      name,
      description: description || "",
      ownerId: user.uid,
      members: [user.uid],
      memberEmails: { [user.uid]: user.email },
      shareCode,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  const updateList = async (listId: string, data: Partial<ShoppingList>) => {
    await updateDoc(doc(db, "lists", listId), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  }

  const deleteList = async (listId: string) => {
    await deleteDoc(doc(db, "lists", listId))
  }

  const shareList = async (listId: string, email: string) => {
    // Find user by email
    const usersQuery = query(collection(db, "users"), where("email", "==", email))
    const usersSnapshot = await getDocs(usersQuery)

    if (usersSnapshot.empty) {
      throw new Error(
        "Usuário não encontrado. O usuário convidado precisa criar uma conta no app primeiro para poder participar da lista.",
      )
    }

    const userId = usersSnapshot.docs[0].id
    const listRef = doc(db, "lists", listId)

    await updateDoc(listRef, {
      members: arrayUnion(userId),
      [`memberEmails.${userId}`]: email,
      updatedAt: Timestamp.now(),
    })
  }

  const removeMember = async (listId: string, userId: string) => {
    const listRef = doc(db, "lists", listId)
    const listDoc = await getDocs(query(collection(db, "lists"), where("__name__", "==", listId)))

    if (!listDoc.empty) {
      const listData = listDoc.docs[0].data()
      const updatedMembers = listData.members.filter((id: string) => id !== userId)
      const updatedMemberEmails = { ...listData.memberEmails }
      delete updatedMemberEmails[userId]

      await updateDoc(listRef, {
        members: updatedMembers,
        memberEmails: updatedMemberEmails,
        updatedAt: Timestamp.now(),
      })
    }
  }

  const joinListByCode = async (shareCode: string) => {
    if (!user) return

    const listsQuery = query(collection(db, "lists"), where("shareCode", "==", shareCode.toUpperCase()))
    const listsSnapshot = await getDocs(listsQuery)

    if (listsSnapshot.empty) {
      throw new Error("Lista não encontrada")
    }

    const listDoc = listsSnapshot.docs[0]
    const listData = listDoc.data()

    // Check if user is already a member
    if (listData.members.includes(user.uid)) {
      throw new Error("Você já é membro desta lista")
    }

    await updateDoc(doc(db, "lists", listDoc.id), {
      members: arrayUnion(user.uid),
      [`memberEmails.${user.uid}`]: user.email,
      updatedAt: Timestamp.now(),
    })

    return listDoc.id
  }

  return { lists, loading, createList, updateList, deleteList, shareList, removeMember, joinListByCode }
}

export function useShoppingItems(listId: string | null) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId) {
      setItems([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "items"), where("listId", "==", listId))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ShoppingItem[]

        itemsData.sort((a, b) => {
          // First, separate by completion status
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1
          }
          // Then sort alphabetically by name
          return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
        })

        setItems(itemsData)
        setLoading(false)
      },
      (error) => {
        console.error("[v0] Error fetching items:", error)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [listId])

  const addItem = async (
    listId: string,
    name: string,
    quantity: number | undefined,
    unitPrice: number | undefined,
    note: string,
    userId: string,
  ) => {
    const itemData: any = {
      listId,
      name,
      note: note || "",
      completed: false,
      addedBy: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    // Only add quantity and unitPrice if they have values
    if (quantity !== undefined && quantity > 0) {
      itemData.quantity = quantity
    }
    if (unitPrice !== undefined && unitPrice > 0) {
      itemData.unitPrice = unitPrice
    }

    await addDoc(collection(db, "items"), itemData)

    // Update list timestamp
    await updateDoc(doc(db, "lists", listId), {
      updatedAt: Timestamp.now(),
    })
  }

  const toggleItem = async (itemId: string, completed: boolean, listId: string) => {
    await updateDoc(doc(db, "items", itemId), {
      completed,
      updatedAt: Timestamp.now(),
    })

    // Update list timestamp
    await updateDoc(doc(db, "lists", listId), {
      updatedAt: Timestamp.now(),
    })
  }

  const deleteItem = async (itemId: string, listId: string) => {
    await deleteDoc(doc(db, "items", itemId))

    // Update list timestamp
    await updateDoc(doc(db, "lists", listId), {
      updatedAt: Timestamp.now(),
    })
  }

  const updateItem = async (itemId: string, listId: string, data: Partial<ShoppingItem>) => {
    await updateDoc(doc(db, "items", itemId), {
      ...data,
      updatedAt: Timestamp.now(),
    })

    // Update list timestamp
    await updateDoc(doc(db, "lists", listId), {
      updatedAt: Timestamp.now(),
    })
  }

  return { items, loading, addItem, toggleItem, deleteItem, updateItem }
}
