"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, X, Loader2, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Member {
  id: string
  email: string
  displayName?: string
  photoURL?: string
}

interface ManageMembersDialogProps {
  listId: string
  memberIds: string[]
  ownerId: string
  currentUserId: string
  onRemoveMember: (userId: string) => Promise<void>
}

export function ManageMembersDialog({
  listId,
  memberIds,
  ownerId,
  currentUserId,
  onRemoveMember,
}: ManageMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open && memberIds.length > 0) {
      loadMembers()
    }
  }, [open, memberIds])

  const loadMembers = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading members for IDs:", memberIds)
      const membersData: Member[] = []

      const listRef = doc(db, "lists", listId)
      const listDoc = await getDoc(listRef)
      const memberEmails = listDoc.exists() ? listDoc.data()?.memberEmails || {} : {}

      for (const memberId of memberIds) {
        const userRef = doc(db, "users", memberId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          membersData.push({
            id: memberId,
            email: userData.email || "Email não disponível",
            displayName: userData.displayName,
            photoURL: userData.photoURL,
          })
        } else if (memberEmails[memberId]) {
          const email = memberEmails[memberId]
          membersData.push({
            id: memberId,
            email: email,
            displayName: email.split("@")[0],
            photoURL: undefined,
          })
        } else {
          membersData.push({
            id: memberId,
            email: "Email não disponível",
            displayName: "Usuário",
            photoURL: undefined,
          })
        }
      }

      console.log("[v0] Loaded members:", membersData)
      setMembers(membersData)
    } catch (error) {
      console.error("[v0] Error loading members:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (member: Member) => {
    setRemovingId(member.id)
    try {
      await onRemoveMember(member.id)
      toast({
        title: "Membro removido",
        description: `${member.displayName || member.email} foi removido da lista.`,
      })
      setMembers(members.filter((m) => m.id !== member.id))
      setConfirmRemove(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      })
    } finally {
      setRemovingId(null)
    }
  }

  const isOwner = currentUserId === ownerId

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Gerenciar Membros</span>
            <span className="sm:hidden">{memberIds.length}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Membros da Lista</DialogTitle>
            <DialogDescription>
              {isOwner ? "Gerencie quem tem acesso a esta lista." : "Veja quem tem acesso a esta lista."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro encontrado.</p>
            ) : (
              members.map((member) => {
                const isMemberOwner = member.id === ownerId
                const isCurrentUser = member.id === currentUserId
                const canRemove = isOwner && !isMemberOwner && !isCurrentUser

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.photoURL || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.displayName?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {member.displayName || member.email}
                          {isCurrentUser && <span className="text-muted-foreground ml-1">(Você)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      {isMemberOwner && <Crown className="w-4 h-4 text-yellow-500 shrink-0" title="Proprietário" />}
                    </div>
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 ml-2 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setConfirmRemove(member)}
                        disabled={removingId === member.id}
                      >
                        {removingId === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmRemove} onOpenChange={(open) => !open && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {confirmRemove?.displayName || confirmRemove?.email} desta lista? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemove && handleRemoveMember(confirmRemove)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
