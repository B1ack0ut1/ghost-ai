"use client";

import { useState } from "react";
import { ArrowRight, Layers3, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const tokenRows = [
  { label: "Base", value: "bg-base / text-copy-primary" },
  { label: "Surface", value: "bg-surface / border-surface-border" },
  { label: "Elevated", value: "bg-elevated / rounded-3xl" },
  { label: "Accent", value: "bg-brand / text-base" },
  { label: "AI", value: "bg-ai / text-ai-text" },
];

export function DesignSystemShowcase() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-surface-border/80 bg-elevated/70 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-brand-dim px-3 py-1 text-xs font-medium text-brand">
              <Sparkles className="h-4 w-4" />
              Design system foundation
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-1 text-xs font-medium text-copy-muted">
              <Layers3 className="h-4 w-4" />
              shadcn/ui primitives
            </span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl leading-tight sm:text-4xl">
              A dark, token-driven UI kit for Ghost AI.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              The core components now share the same color tokens, radius
              scale, and interaction states so the rest of the workspace can be
              built on a consistent foundation.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button className="min-w-40">
            Start building
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="min-w-40">
                Open preview
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Component preview</DialogTitle>
                <DialogDescription>
                  This modal demonstrates the shared dark treatment for
                  overlays, surfaces, and focus states.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 rounded-2xl border border-surface-border bg-surface p-4">
                <p className="text-sm text-copy-muted">
                  The overlay, surface, and button styling are all driven by the
                  same CSS variables in `app/globals.css`.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Primary</Button>
                  <Button size="sm" variant="outline">
                    Outline
                  </Button>
                  <Button size="sm" variant="ghost">
                    Ghost
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Close preview
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Controls</CardTitle>
            <CardDescription>
              Inputs, textareas, and button states inherit the shared token
              palette.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input placeholder="System prompt" />
            <Textarea placeholder="Describe the architecture..." />
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Generate</Button>
              <Button size="sm" variant="secondary">
                Save draft
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tokens</CardTitle>
            <CardDescription>
              The palette is exposed as utility classes through `@theme inline`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="palette">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="palette">Palette</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>
              <TabsContent value="palette">
                <ScrollArea className="h-56 rounded-2xl border border-surface-border bg-surface">
                  <div className="space-y-2 p-4">
                    {tokenRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between rounded-xl border border-surface-border bg-elevated px-4 py-3"
                      >
                        <span className="text-sm font-medium text-copy-primary">
                          {row.label}
                        </span>
                        <span className="text-xs text-copy-muted">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="usage">
                <div className="rounded-2xl border border-surface-border bg-surface p-4 text-sm leading-6 text-copy-muted">
                  Use `bg-base`, `bg-surface`, `bg-elevated`, `text-copy-*`,
                  `border-surface-border`, and `text-brand` across the app to
                  keep the UI consistent with the dark workspace system.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
