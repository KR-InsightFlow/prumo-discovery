import { useState, useEffect, useRef } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const LIFE_AREAS = [
  { key: "saude", label: "Saúde & Energia", icon: "◈", question: "Como você avalia sua energia física e mental para liderar a Versátil nos próximos 3 anos?" },
  { key: "financas", label: "Finanças Pessoais", icon: "◆", question: "Sua situação financeira pessoal te dá liberdade para tomar riscos no negócio, ou te prende a decisões conservadoras?" },
  { key: "relacionamento", label: "Relacionamento", icon: "◇", question: "Seu parceiro(a) entende e apoia a fase de transformação que a Versátil vai passar?" },
  { key: "familia", label: "Família", icon: "▣", question: "Quais compromissos familiares são inegociáveis e limitam seu tempo/energia no negócio?" },
  { key: "carreira", label: "Carreira & Negócio", icon: "▲", question: "Se a Versátil não existisse, o que você estaria fazendo profissionalmente?" },
  { key: "desenvolvimento", label: "Desenvolvimento Pessoal", icon: "◎", question: "Qual habilidade você sabe que precisa desenvolver mas tem evitado?" },
  { key: "lazer", label: "Lazer & Diversão", icon: "✦", question: "Quando foi a última vez que você tirou férias reais, sem pensar na empresa?" },
  { key: "proposito", label: "Propósito & Legado", icon: "◐", question: "Daqui 10 anos, como você quer que as pessoas descrevam o que você construiu?" },
];

const STEPS = [
  { id: "welcome", title: "Início" },
  { id: "identidade", title: "Identidade" },
  { id: "roda", title: "Roda da Vida" },
  { id: "ponte", title: "Ponte Vida–Negócio" },
  { id: "final", title: "Conclusão" },
];

const CustomTick = ({ payload, x, y, textAnchor }) => {
  const area = LIFE_AREAS.find(a => a.label === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor={textAnchor}
        fill="#b4b2a9"
        fontSize={11}
        fontFamily="'DM Sans', sans-serif"
        fontWeight={500}
        dy={4}
      >
        {area?.icon} {payload.value}
      </text>
    </g>
  );
};

export default function ConsultoriaForm() {
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);
  const [identity, setIdentity] = useState({
    nomeCompleto: "", idade: "", estadoCivil: "", filhos: "",
    cidadeEstado: "", faseDaVida: "", definicaoSucesso: "",
    maiorConquista: "", maiorFrustracao: "",
    visao10anos: "", visao5anos: "", visao1ano: "",
    idadeAposentadoria: "", rendaAposentadoria: ""
  });
  const [rodaScores, setRodaScores] = useState(
    Object.fromEntries(LIFE_AREAS.map(a => [a.key, 5]))
  );
  const [rodaTexts, setRodaTexts] = useState(
    Object.fromEntries(LIFE_AREAS.map(a => [a.key, ""]))
  );
  const [rodaJustificativas, setRodaJustificativas] = useState(
    Object.fromEntries(LIFE_AREAS.map(a => [a.key, ""]))
  );
  const [rodaMelhorias, setRodaMelhorias] = useState(
    Object.fromEntries(LIFE_AREAS.map(a => [a.key, ""]))
  );
  const [rodaSubStep, setRodaSubStep] = useState(0);
  const [ponte, setPonte] = useState({
    restricaoVida: "",
    naoNegociavel: "",
    tempoDisponivel: "",
    rendaMinimaAnual: "",
    horizonteTempo: "",
    medoReal: "",
    visaoIntegrada: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const goTo = (nextStep) => {
    setFade(false);
    setTimeout(() => {
      setStep(nextStep);
      setFade(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (formRef.current) formRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const radarData = LIFE_AREAS.map(a => ({
    area: a.label,
    score: rodaScores[a.key],
    fullMark: 10
  }));

  const avgScore = (Object.values(rodaScores).reduce((a, b) => a + b, 0) / 8).toFixed(1);

  const buildFullData = () => ({
    identidade: identity,
    rodaDaVida: {
      scores: rodaScores,
      respostasEstrategicas: rodaTexts,
      justificativas: rodaJustificativas,
      planosDeMelhoria: rodaMelhorias,
      mediaGeral: avgScore
    },
    ponteVidaNegocio: ponte,
    submittedAt: new Date().toISOString()
  });

  const [sending, setSending] = useState(false);

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzz4Rwi_Nhhm8Bw-hyRhlEtjVrOHy41QV6p_SqEywl995W_cf5WCVCZOCnS3hKhMKSj/exec";

  const handleSubmit = async () => {
    setSending(true);
    const data = buildFullData();
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Erro ao enviar:", err);
    }
    setSending(false);
    setSubmitted(true);
    goTo(4);
  };

  const handleDownload = () => {
    const data = buildFullData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `discovery-${identity.nomeCompleto?.replace(/\s+/g, "-").toLowerCase() || "cliente"}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const inputClass = "w-full bg-[#2c2c2a] border border-[#3d3d3a] rounded-lg px-4 py-3 text-[#f1efe8] placeholder-[#888780] focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30 transition-all duration-300 text-sm";
  const textareaClass = inputClass + " min-h-[100px] resize-none";
  const labelClass = "block text-[#b4b2a9] text-xs font-semibold uppercase tracking-[0.15em] mb-2";
  const btnPrimary = "px-8 py-3 bg-[#c8a96e] text-white text-sm font-semibold rounded-lg hover:bg-[#b8943f] transition-all duration-300 tracking-wide";
  const btnSecondary = "px-6 py-3 text-[#94918a] text-sm font-medium hover:text-[#b4b2a9] transition-all duration-300";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#1a1a18", minHeight: "100vh", color: "#f1efe8" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ background: "#1a1a18" }}>
        <div className="max-w-2xl mx-auto px-6 pt-3 pb-2">
          {/* Logo mark */}
          <div className="text-center mb-3">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#f1efe8", letterSpacing: "0.02em" }}>Prumo</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 300, color: "#888780", letterSpacing: "0.06em", marginLeft: 4 }}>Advisory</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className="flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-500"
                  style={{
                    width: 28, height: 28,
                    background: i <= step ? "#c8a96e" : "#3d3d3a",
                    color: i <= step ? "#fff" : "#888780",
                    boxShadow: i === step ? "0 0 20px rgba(200,169,110,0.3)" : "none"
                  }}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-8 sm:w-16 h-px mx-1" style={{ background: i < step ? "#c8a96e" : "#3d3d3a" }} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#888780]">{STEPS[step]?.title}</span>
          </div>
        </div>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #3d3d3a, transparent)" }} />
      </div>

      <div ref={formRef} className="max-w-2xl mx-auto px-6 pt-28 pb-16 overflow-y-auto" style={{ minHeight: "100vh" }}>
        <div
          className="transition-all duration-300"
          style={{ opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(12px)" }}
        >

          {/* ========== WELCOME ========== */}
          {step === 0 && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="inline-block px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.25em] font-semibold mb-8" style={{ border: "1px solid #5f5e5a", color: "#b4b2a9" }}>
                  Confidencial
                </div>

                {/* Typographic Logo */}
                <div className="mb-3">
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: "#f1efe8", letterSpacing: "0.02em" }}>Prumo</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 42, fontWeight: 300, color: "#888780", letterSpacing: "0.06em", marginLeft: 8 }}>Advisory</span>
                </div>
                <div className="w-24 h-px mx-auto mb-6" style={{ background: "linear-gradient(90deg, transparent, #c8a96e, transparent)" }} />

                <h2 className="text-xl sm:text-2xl font-light mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: "#b4b2a9" }}>
                  Discovery Session
                </h2>

                <p className="text-[#94918a] text-sm leading-relaxed max-w-md mx-auto mb-2">
                  Formulário preparatório para a sessão estratégica de rebuilding da Versátil.
                </p>
                <p className="text-[#888780] text-xs leading-relaxed max-w-sm mx-auto">
                  Este documento é pessoal e confidencial. As respostas serão utilizadas exclusivamente para alinhar a estratégia do negócio com seus objetivos de vida.
                </p>
              </div>

              <div className="text-left max-w-sm mx-auto mb-10 space-y-4">
                {[
                  { n: "01", t: "Identidade & Visão de Futuro", d: "Quem é você, onde quer chegar em 1, 5 e 10 anos" },
                  { n: "02", t: "Roda da Vida Estratégica", d: "8 áreas com diagnóstico e plano de ação" },
                  { n: "03", t: "Ponte Vida–Negócio", d: "Restrições reais e visão integrada" },
                ].map(item => (
                  <div key={item.n} className="flex items-start gap-4 p-3 rounded-lg" style={{ background: "#2c2c2a" }}>
                    <span className="text-[#c8a96e] text-xs font-bold mt-0.5">{item.n}</span>
                    <div>
                      <p className="text-sm font-medium text-[#d3d1c7]">{item.t}</p>
                      <p className="text-xs text-[#888780]">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[#888780] text-xs mb-8">Tempo estimado: 35–45 minutos</p>
              <button onClick={() => goTo(1)} className={btnPrimary}>
                Começar →
              </button>
            </div>
          )}

          {/* ========== IDENTIDADE ========== */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <span className="text-[#c8a96e] text-xs font-bold tracking-[0.2em] uppercase">Bloco 01</span>
                <h2 className="text-2xl font-light mt-2 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Identidade & Visão de Futuro
                </h2>
                <p className="text-[#888780] text-xs">Antes de falar de empresa, preciso entender quem está por trás dela — e pra onde essa pessoa quer ir.</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nome completo</label>
                    <input className={inputClass} placeholder="Leandro..." value={identity.nomeCompleto} onChange={e => setIdentity({...identity, nomeCompleto: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>Idade</label>
                    <input className={inputClass} placeholder="34" value={identity.idade} onChange={e => setIdentity({...identity, idade: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Estado civil</label>
                    <select className={inputClass} value={identity.estadoCivil} onChange={e => setIdentity({...identity, estadoCivil: e.target.value})}>
                      <option value="">Selecione</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="uniao">União estável</option>
                      <option value="divorciado">Divorciado(a)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Filhos</label>
                    <input className={inputClass} placeholder="2 filhos, 4 e 7 anos" value={identity.filhos} onChange={e => setIdentity({...identity, filhos: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Cidade / Estado</label>
                  <input className={inputClass} placeholder="São Paulo, SP" value={identity.cidadeEstado} onChange={e => setIdentity({...identity, cidadeEstado: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Em que fase da vida você sente que está?</label>
                  <p className="text-[#888780] text-xs mb-2 -mt-1">Construção? Consolidação? Transição? Recomeço? Descreva com suas palavras.</p>
                  <textarea className={textareaClass} placeholder="Estou numa fase de..." value={identity.faseDaVida} onChange={e => setIdentity({...identity, faseDaVida: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>O que significa "sucesso" pra você hoje?</label>
                  <p className="text-[#888780] text-xs mb-2 -mt-1">Não o que deveria significar. O que realmente significa.</p>
                  <textarea className={textareaClass} placeholder="Pra mim, sucesso hoje é..." value={identity.definicaoSucesso} onChange={e => setIdentity({...identity, definicaoSucesso: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Qual sua maior conquista até aqui?</label>
                  <textarea className={textareaClass} placeholder="Profissional ou pessoal..." value={identity.maiorConquista} onChange={e => setIdentity({...identity, maiorConquista: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>E a maior frustração?</label>
                  <p className="text-[#888780] text-xs mb-2 -mt-1">Algo que você tentou e não funcionou, ou que deveria ter feito diferente.</p>
                  <textarea className={textareaClass} placeholder="O que mais me frustra é..." value={identity.maiorFrustracao} onChange={e => setIdentity({...identity, maiorFrustracao: e.target.value})} />
                </div>

                {/* ===== PROJEÇÃO DE FUTURO ===== */}
                <div className="pt-6 mt-6" style={{ borderTop: "1px solid #3d3d3a" }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(200,169,110,0.1)", border: "1px solid #c8a96e", color: "#c8a96e" }}>→</div>
                    <div>
                      <p className="text-sm font-semibold text-[#f1efe8]">Projeção de Futuro</p>
                      <p className="text-[#888780] text-xs">Pense no Leandro de verdade, não no ideal. Dentro de uma realidade possível.</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                      <label className={labelClass}>
                        <span className="text-[#c8a96e] mr-2">10 anos</span>
                        Como você se enxerga daqui a 10 anos?
                      </label>
                      <p className="text-[#888780] text-xs mb-3">Morando onde? Qual a renda? Viajando com que frequência? Filhos em que fase? Qual o estilo de vida?</p>
                      <textarea className={textareaClass + " !min-h-[120px]"} placeholder="Em 10 anos eu me vejo..." value={identity.visao10anos} onChange={e => setIdentity({...identity, visao10anos: e.target.value})} />
                    </div>

                    <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                      <label className={labelClass}>
                        <span className="text-[#f59e0b] mr-2">5 anos</span>
                        E daqui a 5 anos?
                      </label>
                      <p className="text-[#888780] text-xs mb-3">Mesmas dimensões: moradia, renda, viagens, família, estilo de vida. O que precisa ter mudado?</p>
                      <textarea className={textareaClass + " !min-h-[120px]"} placeholder="Em 5 anos eu me vejo..." value={identity.visao5anos} onChange={e => setIdentity({...identity, visao5anos: e.target.value})} />
                    </div>

                    <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                      <label className={labelClass}>
                        <span className="text-[#10b981] mr-2">1 ano</span>
                        E daqui a 1 ano?
                      </label>
                      <p className="text-[#888780] text-xs mb-3">O que precisa ser diferente do hoje pra você sentir que o ano valeu? Moradia, renda, rotina, família.</p>
                      <textarea className={textareaClass + " !min-h-[120px]"} placeholder="Em 1 ano eu preciso ter..." value={identity.visao1ano} onChange={e => setIdentity({...identity, visao1ano: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                        <label className={labelClass}>Com quantos anos você gostaria de se aposentar?</label>
                        <p className="text-[#888780] text-xs mb-3">Dentro de uma realidade. Não o sonho, o plano.</p>
                        <input className={inputClass} placeholder="Ex: 55 anos" value={identity.idadeAposentadoria} onChange={e => setIdentity({...identity, idadeAposentadoria: e.target.value})} />
                      </div>
                      <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                        <label className={labelClass}>Renda mensal confortável na aposentadoria</label>
                        <p className="text-[#888780] text-xs mb-3">Em valores de hoje, quanto te daria conforto?</p>
                        <input className={inputClass} placeholder="R$ ..." value={identity.rendaAposentadoria} onChange={e => setIdentity({...identity, rendaAposentadoria: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-10 pt-6" style={{ borderTop: "1px solid #3d3d3a" }}>
                <button onClick={() => goTo(0)} className={btnSecondary}>← Voltar</button>
                <button onClick={() => goTo(2)} className={btnPrimary}>Próximo bloco →</button>
              </div>
            </div>
          )}

          {/* ========== RODA DA VIDA ========== */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <span className="text-[#c8a96e] text-xs font-bold tracking-[0.2em] uppercase">Bloco 02</span>
                <h2 className="text-2xl font-light mt-2 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Roda da Vida Estratégica
                </h2>
                <p className="text-[#888780] text-xs">Avalie cada área de 1 a 10, justifique a nota e responda a pergunta estratégica.</p>
              </div>

              {/* Radar Chart */}
              <div className="rounded-xl p-4 mb-8" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#888780]">Visão geral</span>
                  <span className="text-sm font-semibold" style={{ color: parseFloat(avgScore) < 5 ? "#ef4444" : parseFloat(avgScore) < 7 ? "#f59e0b" : "#10b981" }}>
                    Média: {avgScore}/10
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#3d3d3a" />
                    <PolarAngleAxis dataKey="area" tick={<CustomTick />} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                      dataKey="score"
                      stroke="#c8a96e"
                      fill="#c8a96e"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#c8a96e", stroke: "#1a1a18", strokeWidth: 2 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Area cards - show current substep */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs text-[#888780]">Área {rodaSubStep + 1} de {LIFE_AREAS.length}</span>
                <div className="flex-1 h-1 rounded-full" style={{ background: "#3d3d3a" }}>
                  <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${((rodaSubStep + 1) / LIFE_AREAS.length) * 100}%`, background: "#c8a96e" }} />
                </div>
              </div>

              {(() => {
                const area = LIFE_AREAS[rodaSubStep];
                const score = rodaScores[area.key];
                return (
                  <div className="rounded-xl p-6" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">{area.icon}</span>
                      <div>
                        <h3 className="text-base font-semibold text-[#f1efe8]">{area.label}</h3>
                      </div>
                    </div>

                    {/* Score slider */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <label className={labelClass + " !mb-0"}>Sua nota</label>
                        <span className="text-2xl font-bold" style={{
                          color: score <= 3 ? "#ef4444" : score <= 5 ? "#f59e0b" : score <= 7 ? "#c8a96e" : "#10b981",
                          fontFamily: "'Playfair Display', serif"
                        }}>
                          {score}
                        </span>
                      </div>
                      <input
                        type="range" min="1" max="10" step="1"
                        value={score}
                        onChange={e => setRodaScores({ ...rodaScores, [area.key]: parseInt(e.target.value) })}
                        className="w-full accent-[#c8a96e]"
                        style={{ height: "6px" }}
                      />
                      <div className="flex justify-between text-[10px] text-[#888780] mt-1">
                        <span>Crítico</span>
                        <span>Excelente</span>
                      </div>
                    </div>

                    {/* Justificativa da nota */}
                    <div className="mb-5">
                      <label className={labelClass}>Por que essa nota?</label>
                      <p className="text-[#888780] text-xs mb-2">O que te fez dar {score} e não uma nota maior ou menor?</p>
                      <textarea
                        className={textareaClass}
                        placeholder="Dei essa nota porque..."
                        value={rodaJustificativas[area.key]}
                        onChange={e => setRodaJustificativas({ ...rodaJustificativas, [area.key]: e.target.value })}
                      />
                    </div>

                    {/* Pergunta de melhoria - só aparece se nota < 8 */}
                    {score < 8 && (
                      <div className="mb-5 rounded-lg p-4" style={{ background: "#2c2c2a", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <label className={labelClass} style={{ color: "#fbbf24" }}>O que falta pra essa nota estar entre 9 e 10?</label>
                        <p className="text-[#888780] text-xs mb-2">Seja específico. O que precisaria mudar na sua vida pra essa área ser excelente?</p>
                        <textarea
                          className={textareaClass}
                          style={{ borderColor: "#3d3520" }}
                          placeholder="Pra chegar em 9 ou 10, eu precisaria..."
                          value={rodaMelhorias[area.key]}
                          onChange={e => setRodaMelhorias({ ...rodaMelhorias, [area.key]: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Pergunta estratégica original */}
                    <div>
                      <label className={labelClass}>{area.question}</label>
                      <textarea
                        className={textareaClass}
                        placeholder="Seja honesto. Não existe resposta certa."
                        value={rodaTexts[area.key]}
                        onChange={e => setRodaTexts({ ...rodaTexts, [area.key]: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4" style={{ borderTop: "1px solid #3d3d3a" }}>
                      <button
                        onClick={() => { rodaSubStep > 0 ? setRodaSubStep(rodaSubStep - 1) : goTo(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={btnSecondary}
                      >
                        ← {rodaSubStep === 0 ? "Bloco anterior" : "Área anterior"}
                      </button>
                      <button
                        onClick={() => { rodaSubStep < LIFE_AREAS.length - 1 ? setRodaSubStep(rodaSubStep + 1) : goTo(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={btnPrimary}
                      >
                        {rodaSubStep === LIFE_AREAS.length - 1 ? "Próximo bloco →" : "Próxima área →"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========== PONTE VIDA–NEGÓCIO ========== */}
          {step === 3 && (
            <div>
              <div className="mb-8">
                <span className="text-[#c8a96e] text-xs font-bold tracking-[0.2em] uppercase">Bloco 03</span>
                <h2 className="text-2xl font-light mt-2 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Ponte Vida–Negócio
                </h2>
                <p className="text-[#888780] text-xs">Aqui conectamos sua vida pessoal com as decisões que vamos tomar na Versátil.</p>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                  <label className={labelClass}>Qual área da sua vida mais RESTRINGE as decisões de negócio hoje?</label>
                  <p className="text-[#888780] text-xs mb-3">Ex: "Financeiramente preciso de X por mês, então não posso arriscar parar de vender projetos."</p>
                  <textarea className={textareaClass} value={ponte.restricaoVida} onChange={e => setPonte({...ponte, restricaoVida: e.target.value})} placeholder="A área que mais me limita é..." />
                </div>

                <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                  <label className={labelClass}>O que é inegociável na sua vida pessoal?</label>
                  <p className="text-[#888780] text-xs mb-3">O que eu NÃO POSSO te pedir pra sacrificar durante a transformação da Versátil?</p>
                  <textarea className={textareaClass} value={ponte.naoNegociavel} onChange={e => setPonte({...ponte, naoNegociavel: e.target.value})} placeholder="Eu não abro mão de..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                    <label className={labelClass}>Horas/semana disponíveis para a Versátil</label>
                    <p className="text-[#888780] text-xs mb-3">Honestamente. Não o ideal, o real.</p>
                    <input className={inputClass} value={ponte.tempoDisponivel} onChange={e => setPonte({...ponte, tempoDisponivel: e.target.value})} placeholder="Ex: 40h, 50h, 60h+" />
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                    <label className={labelClass}>Renda pessoal mínima anual</label>
                    <p className="text-[#888780] text-xs mb-3">Quanto você precisa tirar do negócio, no mínimo?</p>
                    <input className={inputClass} value={ponte.rendaMinimaAnual} onChange={e => setPonte({...ponte, rendaMinimaAnual: e.target.value})} placeholder="R$ ..." />
                  </div>
                </div>

                <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                  <label className={labelClass}>Horizonte de tempo</label>
                  <p className="text-[#888780] text-xs mb-3">Em quanto tempo você espera ver a Versátil transformada? Seja realista.</p>
                  <select className={inputClass} value={ponte.horizonteTempo} onChange={e => setPonte({...ponte, horizonteTempo: e.target.value})}>
                    <option value="">Selecione</option>
                    <option value="6m">6 meses — Preciso de resultado rápido</option>
                    <option value="12m">12 meses — Tenho fôlego para 1 ano</option>
                    <option value="24m">24 meses — Aceito uma construção mais sólida</option>
                    <option value="36m">36 meses — Estou pensando no longo prazo</option>
                  </select>
                </div>

                <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                  <label className={labelClass}>Qual seu medo real sobre essa transformação?</label>
                  <p className="text-[#888780] text-xs mb-3">Não o medo bonito. O medo que te acorda de madrugada.</p>
                  <textarea className={textareaClass} value={ponte.medoReal} onChange={e => setPonte({...ponte, medoReal: e.target.value})} placeholder="O que mais me preocupa é..." />
                </div>

                <div className="rounded-xl p-5" style={{ background: "#2c2c2a", border: "1px solid rgba(200,169,110,0.2)" }}>
                  <label className={labelClass} style={{ color: "#c8a96e" }}>Visão integrada — a pergunta final</label>
                  <p className="text-[#b4b2a9] text-xs mb-3">Descreva um dia ideal seu, daqui a 3 anos, do momento que acorda até dormir. Inclua trabalho, família, saúde, tudo. Sem filtro.</p>
                  <textarea
                    className={textareaClass + " !min-h-[140px]"}
                    style={{ borderColor: "#3d3520" }}
                    value={ponte.visaoIntegrada}
                    onChange={e => setPonte({...ponte, visaoIntegrada: e.target.value})}
                    placeholder="Acordo às 6h, faço exercício, levo meus filhos na escola..."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-10 pt-6" style={{ borderTop: "1px solid #3d3d3a" }}>
                <button onClick={() => { setRodaSubStep(LIFE_AREAS.length - 1); goTo(2); }} className={btnSecondary}>← Voltar</button>
                <button onClick={handleSubmit} disabled={sending} className={btnPrimary + " !bg-[#10b981] hover:!bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"}>
                  {sending ? "Enviando..." : "Finalizar & Enviar ✓"}
                </button>
              </div>
            </div>
          )}

          {/* ========== FINAL ========== */}
          {step === 4 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: "rgba(200,169,110,0.1)", border: "2px solid #c8a96e" }}>
                <span className="text-2xl" style={{ color: "#c8a96e" }}>✓</span>
              </div>
              <h2 className="text-2xl font-light mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#f1efe8" }}>
                Suas respostas foram registradas
              </h2>
              <p className="text-[#b4b2a9] text-sm max-w-md mx-auto mb-4 leading-relaxed">
                Obrigado pela honestidade. Cada resposta que você deu aqui vai ser analisada com cuidado antes da nossa conversa.
              </p>
              <p className="text-[#888780] text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Esse formulário é o primeiro passo. O próximo é nosso: a equipe da Prumo Advisory vai entrar em contato com você para agendar a sessão de Discovery — uma conversa estratégica de 90 minutos, baseada nas suas respostas, onde vamos aprofundar o que importa.
              </p>

              {/* Summary radar */}
              <div className="rounded-xl p-6 max-w-md mx-auto mb-8" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#888780] mb-4">Sua Roda da Vida</p>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#3d3d3a" />
                    <PolarAngleAxis dataKey="area" tick={<CustomTick />} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#c8a96e" fill="#c8a96e" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#c8a96e" }} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-sm text-[#b4b2a9] mt-2">Média geral: <span className="font-bold" style={{ color: "#c8a96e" }}>{avgScore}</span>/10</p>
              </div>

              <div className="rounded-lg p-5 max-w-md mx-auto" style={{ background: "#2c2c2a", border: "1px solid #3d3d3a" }}>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "#c8a96e" }}>Próximo passo</p>
                <p className="text-sm text-[#b4b2a9] leading-relaxed">
                  Aguarde nosso contato. Vamos agendar sua sessão de Discovery e começar a colocar seu negócio no prumo.
                </p>
              </div>

              {/* Logo footer */}
              <div className="mt-12 pt-6" style={{ borderTop: "1px solid #3d3d3a" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#888780" }}>Prumo</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 300, color: "#5f5e5a", marginLeft: 4 }}>Advisory</span>
                <p className="text-[11px] mt-1" style={{ color: "#5f5e5a", fontStyle: "italic" }}>Primeiro a vida. Depois o negócio.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
