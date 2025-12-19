"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import * as React from "react";

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ComingSoonDialog({ open, onOpenChange }: ComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-foreground shadow-brutalist">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Construction className="h-6 w-6 text-primary" />
            Coming Soon
          </DialogTitle>
          <DialogDescription className="text-lg pt-4 text-foreground/80">
            We are working hard to bring Memento to life. Follow us on{" "}
            <a 
              href="https://x.com/mementodotmoney" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              @mementodotmoney
            </a>{" "}
            to stay updated on the launch.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-4">
           <Button variant="brutalist" onClick={() => onOpenChange(false)}>
             Got it
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useComingSoon() {
  const [open, setOpen] = React.useState(false);
  
  const showComingSoon = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpen(true);
  };

  return { open, setOpen, showComingSoon };
}






