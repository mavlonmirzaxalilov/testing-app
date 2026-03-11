'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ImageAnswerModalProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
  questionText: string
}

export function ImageAnswerModal({
  isOpen,
  imageUrl,
  onClose,
  questionText,
}: ImageAnswerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Suratli Javob</h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{questionText}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center bg-muted rounded-lg min-h-[300px]">
            <img
              src={imageUrl}
              alt="Suratli javob"
              className="max-w-full max-h-[500px] object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
