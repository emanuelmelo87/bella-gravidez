import { Component } from "react";

const C = { vinho: "#4e2b53", taupe: "#ab9d95", bege: "#eed1b8", rosa: "#c38a97", bg: "#f7ece0" };

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: 24, gap: 16,
          background: C.bg, fontFamily: "'DM Sans',sans-serif", textAlign: "center",
        }}>
          <div style={{ fontSize: 48 }}>🌸</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 24, color: C.vinho }}>
            Algo deu errado
          </div>
          <div style={{ fontSize: 14, color: C.taupe, maxWidth: 320, lineHeight: 1.6 }}>
            Tivemos um problema ao carregar esta tela. Seus dados estão seguros.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} style={{
              padding: "12px 24px", background: C.vinho, color: C.bege,
              border: "none", borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 500,
            }}>
              Recarregar
            </button>
            <button onClick={() => { window.location.href = "/"; }} style={{
              padding: "12px 24px", background: "transparent", color: C.taupe,
              border: `1.5px solid ${C.bege}`, borderRadius: 14, cursor: "pointer", fontSize: 14,
            }}>
              Início
            </button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              fontSize: 11, color: "#b91c1c", background: "#fee2e2", padding: 12,
              borderRadius: 8, maxWidth: "90vw", overflow: "auto", textAlign: "left",
            }}>
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
