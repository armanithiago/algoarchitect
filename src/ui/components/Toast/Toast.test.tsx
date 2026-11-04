import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "./Toast";
import { ToastHost } from "./ToastHost";
import { useToastStore } from "./useToastStore";

describe("Toast", () => {
  afterEach(() => vi.useRealTimers());

  it("update variant: role status, Refresh action, dismiss button", async () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    render(<Toast variant="update" message="Update ready." onAction={onAction} onDismiss={onDismiss} />);
    expect(screen.getByRole("status")).toHaveTextContent("Update ready.");
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onAction).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("error variant uses role alert", () => {
    render(<Toast variant="error" message="Nope" onDismiss={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("info auto-dismisses after 4 s, error after 6 s", () => {
    vi.useFakeTimers();
    const info = vi.fn();
    const err = vi.fn();
    render(<Toast variant="info" message="i" onDismiss={info} />);
    render(<Toast variant="error" message="e" onDismiss={err} />);
    act(() => void vi.advanceTimersByTime(3999));
    expect(info).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1));
    expect(info).toHaveBeenCalledOnce();
    expect(err).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(2000));
    expect(err).toHaveBeenCalledOnce();
  });

  it("update toasts and toasts with an action never auto-dismiss", () => {
    vi.useFakeTimers();
    const a = vi.fn();
    const b = vi.fn();
    render(<Toast variant="update" message="u" onDismiss={a} />);
    render(<Toast variant="success" message="s" actionLabel="Undo" onDismiss={b} />);
    act(() => void vi.advanceTimersByTime(60000));
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it("pauses auto-dismiss while hovered", async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast variant="info" message="i" onDismiss={onDismiss} />);
    const el = screen.getByRole("status");
    act(() => {
      el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });
    act(() => void vi.advanceTimersByTime(10000));
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe("ToastHost", () => {
  beforeEach(() => useToastStore.getState().reset());

  it("shows one toast at a time and Refresh runs the action then dismisses", async () => {
    const onAction = vi.fn();
    render(<ToastHost />);
    act(() => {
      useToastStore.getState().show({ id: "u", variant: "update", message: "Update ready.", onAction });
      useToastStore.getState().show({ id: "x", variant: "success", message: "Saved" });
    });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("renders nothing while an update toast is suspended", () => {
    render(<ToastHost />);
    act(() => {
      useToastStore.getState().setSuspended(true);
      useToastStore.getState().show({ id: "u", variant: "update", message: "Update ready." });
    });
    expect(screen.queryByRole("status")).toBeNull();
    act(() => useToastStore.getState().setSuspended(false));
    expect(screen.getByRole("status")).toHaveTextContent("Update ready.");
  });
});
