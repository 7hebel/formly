import { Sparkles } from "lucide-react"


export default function InfoAI({ children }) {
    return (
        <div className="info-ai-block">
            <Sparkles/>
            <span className="info-ai-text">{children}</span>
        </div>
    )
}
