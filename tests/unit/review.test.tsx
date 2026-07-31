import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/App";

describe("review interface", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
  });

  it("renders the evidence-led phase gate", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Evidence before identity." })).toBeInTheDocument();
    expect(screen.getByText("Phase 1 / unapproved")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Open full-screen test/ })).toHaveLength(3);
  });

  it("presents five positioning options without a selected winner", () => {
    render(<App />);
    expect(screen.getByText("The Private Occasion Atelier")).toBeInTheDocument();
    expect(screen.getByText("The Cultural Editions Studio")).toBeInTheDocument();
    expect(screen.getByText("The Launch-World Studio")).toBeInTheDocument();
    expect(screen.getByText("The Creative-Development Partner")).toBeInTheDocument();
    expect(screen.getByText("The Focused Digital Experience Studio")).toBeInTheDocument();
  });
});
