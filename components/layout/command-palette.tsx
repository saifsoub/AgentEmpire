"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Command, Search, X } from "lucide-react";
import {
  filterCommands,
  isCommandPaletteShortcut,
  nextCommandIndex,
} from "@/lib/control-plane/navigation";

export function CommandPalette() {
  const router = useRouter();
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commands = useMemo(() => filterCommands(query), [query]);

  function openPalette() {
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }

  function close(restoreFocus = true) {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
    if (restoreFocus) {
      const target = previouslyFocusedRef.current && previouslyFocusedRef.current !== document.body
        ? previouslyFocusedRef.current
        : triggerRef.current;
      window.setTimeout(() => target?.focus(), 0);
    }
  }

  function choose(href: string) {
    close(false);
    router.push(href);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isCommandPaletteShortcut(event)) {
        event.preventDefault();
        if (open) close();
        else openPalette();
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      } else if (event.key === "Tab" && open) {
        const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
          'input:not([disabled]), button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
        ) ?? [])];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const appContent = document.querySelector<HTMLElement>("[data-app-shell-content]");
    const previousInert = appContent?.inert ?? false;
    const previousAriaHidden = appContent ? appContent.getAttribute("aria-hidden") : null;
    const previousOverflow = document.body.style.overflow;
    if (appContent) {
      appContent.inert = true;
      appContent.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "hidden";
    return () => {
      if (appContent) {
        appContent.inert = previousInert;
        if (previousAriaHidden === null) appContent.removeAttribute("aria-hidden");
        else appContent.setAttribute("aria-hidden", previousAriaHidden);
      }
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setSelectedIndex(commands.length ? 0 : -1);
  }, [commands.length, query]);

  useEffect(() => {
    if (open && selectedIndex >= 0) optionRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, selectedIndex]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open command palette"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPalette}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 text-sm text-secondary transition hover:border-accent/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
      >
        <Command className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Command</span>
        <kbd className="hidden rounded-md border border-border bg-app/70 px-1.5 py-0.5 text-[10px] text-muted md:inline">⌘ K</kbd>
      </button>

      {open ? createPortal((
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-3 pt-[10vh] backdrop-blur-sm" onMouseDown={() => close()}>
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${listId}-title`}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-[#080c18] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <label id={`${listId}-title`} htmlFor={`${listId}-input`} className="sr-only">Search command destinations</label>
              <input
                ref={inputRef}
                id={`${listId}-input`}
                role="combobox"
                aria-controls={listId}
                aria-expanded="true"
                aria-autocomplete="list"
                aria-activedescendant={selectedIndex >= 0 ? `${listId}-${commands[selectedIndex]?.id}` : undefined}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (["ArrowDown", "ArrowUp"].includes(event.key) && commands.length > 0) {
                    event.preventDefault();
                    setSelectedIndex(nextCommandIndex(selectedIndex, event.key, commands.length));
                  } else if (event.key === "Enter" && selectedIndex >= 0) {
                    event.preventDefault();
                    choose(commands[selectedIndex].href);
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    close();
                  }
                }}
                placeholder="Go to projects, agents, approvals, files…"
                className="min-h-14 w-full bg-transparent text-base text-primary outline-none placeholder:text-muted"
              />
              <button type="button" aria-label="Close command palette" onClick={() => close()} className="rounded-lg p-2 text-muted hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div id={listId} role="listbox" aria-label="Command destinations" className="max-h-[60vh] overflow-y-auto p-2">
              {commands.map((item, index) => (
                <button
                  ref={(element) => { optionRefs.current[index] = element; }}
                  key={item.id}
                  id={`${listId}-${item.id}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={index === selectedIndex}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => choose(item.href)}
                  className={`flex w-full items-start justify-between gap-4 rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none ${index === selectedIndex ? "bg-surface2 text-primary" : "text-secondary hover:bg-surface/70 hover:text-primary"}`}
                >
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{item.description}</span>
                  </span>
                  <span className="mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted">{item.group}</span>
                </button>
              ))}
              {commands.length === 0 ? <p role="status" aria-live="polite" className="px-3 py-8 text-center text-sm text-muted">No matching destination.</p> : null}
            </div>
          </section>
        </div>
      ), document.body) : null}
    </>
  );
}
