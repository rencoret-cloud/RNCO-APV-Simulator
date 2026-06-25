const { useState, useEffect, useMemo } = React;

function Info({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Tablas de FACTORES (copiadas 1:1 de la hoja "FACTORES" del Excel)
// ---------------------------------------------------------------------------

// Valores de respaldo (mismos que trae el Excel) — se usan mientras cargan
// los valores en vivo, para que los resultados se vean al instante sin
// esperar la red. Se reemplazan silenciosamente apenas responde mindicador.cl.
const FALLBACK_UF = 40801.29;
const FALLBACK_UTM = 71506;


// Tabla de impuesto único de segunda categoría (tramos en pesos, ya
// expresados sobre la UTM vigente cargada desde C8 del Excel original).
// Se recalculan en runtime usando la UTM real del día (ver TAX_BRACKETS_UTM).
const TAX_BRACKETS_UTM = [
  { hastaUTM: 13.5, tasa: 0, rebajaUTM: 0 },
  { hastaUTM: 30, tasa: 0.04, rebajaUTM: 37740.06 / 71506 },
  { hastaUTM: 50, tasa: 0.08, rebajaUTM: 121606.86 / 71506 },
  { hastaUTM: 70, tasa: 0.135, rebajaUTM: 313801.61 / 71506 },
  { hastaUTM: 90, tasa: 0.23, rebajaUTM: 778563.46 / 71506 },
  { hastaUTM: 120, tasa: 0.304, rebajaUTM: 1244024.2 / 71506 },
  { hastaUTM: 310, tasa: 0.35, rebajaUTM: 1629811.48 / 71506 },
  { hastaUTM: Infinity, tasa: 0.4, rebajaUTM: 2713090.98 / 71506 },
];

const AFP_RATES = {
  "AFP CAPITAL": 0.0144,
  "AFP CUPRUM": 0.0144,
  "AFP HABITAT": 0.0127,
  "AFP MODELO": 0.0058,
  "AFP PLANVITAL": 0.0116,
  "AFP PROVIDA": 0.0145,
  "AFP UNO": 0.0046,
};
const AFP_LIST = Object.keys(AFP_RATES);

const PERFILES = ["Muy Arriesgado", "Moderado", "Muy Conservador"];

// Factor 1: capitaliza el SALDO actual a la fecha de pensión, según años
// restantes (índice 1..46) y perfil de riesgo.
const FACTOR1 = {
  "Muy Arriesgado": [1.05,1.1,1.15,1.2,1.26,1.32,1.38,1.44,1.51,1.58,1.66,1.74,1.82,1.9,1.99,2.09,2.18,2.29,2.39,2.51,2.62,2.75,2.88,3.01,3.15,3.3,3.46,3.62,3.79,3.97,4.15,4.35,4.55,4.77,4.99,5.22,5.47,5.73,6,6.28,6.57,6.88,7.21,7.54,7.9,8.27],
  "Moderado": [1.03,1.06,1.09,1.13,1.16,1.2,1.23,1.27,1.31,1.35,1.39,1.43,1.48,1.52,1.57,1.62,1.67,1.72,1.77,1.82,1.88,1.94,2,2.06,2.12,2.18,2.25,2.32,2.39,2.46,2.54,2.62,2.7,2.78,2.86,2.95,3.04,3.13,3.23,3.33,3.43,3.53,3.64,3.75,3.87,3.98],
  "Muy Conservador": [1.02,1.04,1.05,1.06,1.1,1.13,1.15,1.17,1.2,1.22,1.24,1.27,1.29,1.32,1.35,1.37,1.4,1.43,1.46,1.49,1.52,1.55,1.58,1.61,1.64,1.67,1.71,1.74,1.78,1.81,1.85,1.88,1.92,1.96,2,2.04,2.08,2.12,2.16,2.21,2.25,2.3,2.34,2.39,2.44,2.49],
};

// Factor 2: capitaliza APORTES MENSUALES (cotización AFP y APV) a lo largo de
// los años restantes, según perfil de riesgo.
const FACTOR2 = {
  "Muy Arriesgado": [12,26,40,54,70,87,105,124,145,167,190,215,241,269,299,331,364,400,439,480,523,570,619,671,727,787,851,918,990,1057,1149,1236,1328,1427,1532,1644,1763,1890,2025,2470,2323,2486,2660,2846,3043,3253],
  "Moderado": [12,25,33,52,67,82,98,115,132,150,169,189,210,232,255,278,303,329,336,384,414,445,477,511,546,583,621,661,703,747,793,841,891,943,998,1055,1115,1177,1242,1311,1382,1456,1534,1615,1700,1789],
  "Muy Conservador": [12,24,37,50,53,76,90,104,118,133,147,162,178,193,209,226,242,259,277,294,312,331,349,368,388,408,428,449,470,491,513,536,558,582,606,630,654,680,705,731,758,785,813,842,871,900],
};

// Factor 3: divisor de renta vitalicia (esperanza de vida/conversión) según
// edad de pensión y sexo.
const FACTOR3 = {
  ages: [50, 55, 60, 65, 70, 75],
  Hombre: [280, 251, 220, 188, 156, 124],
  Mujer: [310, 284, 255, 224, 191, 157],
};

function lookupFactor(table, perfil, years) {
  const arr = table[perfil];
  if (!arr || years < 1) return 0;
  const idx = Math.min(Math.round(years), arr.length) - 1;
  return arr[Math.max(0, idx)] || arr[arr.length - 1];
}

function lookupFactor3(edad, sexo) {
  const arr = sexo === "Masculino" ? FACTOR3.Hombre : FACTOR3.Mujer;
  const ages = FACTOR3.ages;
  // VLOOKUP aproximado (igual al Excel): busca coincidencia exacta de edad;
  // si no existe, usa el tramo más cercano hacia abajo.
  let idx = ages.indexOf(edad);
  if (idx === -1) {
    idx = 0;
    for (let i = 0; i < ages.length; i++) if (ages[i] <= edad) idx = i;
  }
  return arr[idx];
}

function impuestoUnico(rentaAfecta, utm) {
  if (rentaAfecta <= 0) return { impuesto: 0, tasa: 0 };
  const rentaUTM = rentaAfecta / utm;
  let bracket = TAX_BRACKETS_UTM[0];
  for (const b of TAX_BRACKETS_UTM) {
    if (rentaUTM <= b.hastaUTM) { bracket = b; break; }
    bracket = b;
  }
  const rebajaPesos = bracket.rebajaUTM * utm;
  const impuesto = Math.max(0, rentaAfecta * bracket.tasa - rebajaPesos);
  return { impuesto, tasa: bracket.tasa };
}

const CLP = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
function clp(n) {
  if (!isFinite(n) || n === null || n === undefined) return "—";
  return "$" + CLP.format(Math.round(n));
}
function pct(n, decimals = 1) {
  if (!isFinite(n) || n === null || n === undefined) return "—";
  return (n * 100).toFixed(decimals) + "%";
}
function uf(n) {
  if (!isFinite(n) || n === null || n === undefined) return "—";
  return n.toFixed(2) + " UF";
}

// ---------------------------------------------------------------------------
// Hook: indicadores económicos en vivo (UF / UTM) desde mindicador.cl
// ---------------------------------------------------------------------------
function useIndicadores() {
  const [state, setState] = useState({ status: "loading", uf: null, utm: null, fecha: null });

  useEffect(() => {
    let alive = true;
    fetch("https://mindicador.cl/api")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setState({
          status: "ok",
          uf: data.uf?.valor ?? null,
          utm: data.utm?.valor ?? null,
          fecha: data.uf?.fecha ?? null,
        });
      })
      .catch(() => {
        if (alive) setState((s) => ({ ...s, status: "error" }));
      });
    return () => { alive = false; };
  }, []);

  return state;
}

// ---------------------------------------------------------------------------
// Motor de cálculo (replica exacta de la hoja "SIM BEN APV")
// ---------------------------------------------------------------------------
function calcular(inputs) {
  const { ufValor, utmValor, rentaBruta, pagoSalud, edad, sexo, afp, apvUF,
          perfilRiesgo, saldoAFP, saldoAPV, edadPension, pensionDeseada } = inputs;

  const afpRate = AFP_RATES[afp] ?? 0;
  const topeAFP_UF = 90;
  const topeCesantia_UF = 135.2;

  const cotizAFP = Math.min(rentaBruta, topeAFP_UF * ufValor) * (0.10 + afpRate);
  const cotizSalud = Math.min(rentaBruta, topeAFP_UF * ufValor) * 0.07;
  const cotizCesantia = Math.min(rentaBruta, topeCesantia_UF * ufValor) * 0.006;
  const apvPesos = apvUF * ufValor;

  // ---- Columna SIN APV ----
  const sinApv = {
    rentaBruta,
    cotizAFP, cotizSalud, cotizCesantia,
    apv: 0,
    rentaAfecta: rentaBruta - cotizAFP - cotizSalud - cotizCesantia,
  };
  const tSin = impuestoUnico(sinApv.rentaAfecta, utmValor);
  sinApv.impuesto = tSin.impuesto;
  sinApv.adicionalIsapre = pagoSalud - cotizSalud;
  sinApv.rentaLiquida = sinApv.rentaAfecta - sinApv.impuesto - sinApv.adicionalIsapre;

  // ---- Régimen A (bonificación estatal 15%, no rebaja base tributaria) ----
  const regA = {
    rentaBruta, cotizAFP, cotizSalud, cotizCesantia,
    apv: apvPesos,
    rentaAfecta: sinApv.rentaAfecta, // misma base que "sin APV"
  };
  const tA = impuestoUnico(regA.rentaAfecta, utmValor);
  regA.impuesto = tA.impuesto;
  regA.adicionalIsapre = pagoSalud - cotizSalud;
  regA.rentaLiquida = regA.rentaAfecta - regA.impuesto - regA.adicionalIsapre - regA.apv;
  regA.beneficioMensual = Math.min(apvPesos * 0.15, (6 * utmValor) / 12);
  regA.aporteCliente = apvPesos;
  regA.rentabilidadInmediata = regA.aporteCliente === 0 ? 0 : regA.beneficioMensual / regA.aporteCliente;
  regA.tramoTasa = tA.tasa;
  regA.beneficioAnual = regA.beneficioMensual * 12;

  // ---- Régimen B (rebaja la base tributaria, ahorro de impuesto) ----
  const regB = {
    rentaBruta, cotizAFP, cotizSalud, cotizCesantia,
    apv: apvPesos,
    rentaAfecta: rentaBruta - cotizAFP - cotizSalud - cotizCesantia - apvPesos,
  };
  const tB = impuestoUnico(regB.rentaAfecta, utmValor);
  regB.impuesto = tB.impuesto;
  regB.adicionalIsapre = pagoSalud - cotizSalud;
  regB.rentaLiquida = regB.rentaAfecta - regB.impuesto - regB.adicionalIsapre;
  regB.beneficioMensual = Math.max(0, Math.min(sinApv.impuesto - regB.impuesto, (600 * ufValor) / 12));
  regB.aporteCliente = apvPesos - regB.beneficioMensual;
  regB.rentabilidadInmediata = regB.aporteCliente === 0 ? 0 : regB.beneficioMensual / regB.aporteCliente;
  regB.tramoTasa = tB.tasa;
  regB.beneficioAnual = regB.beneficioMensual * 12;

  // ---- Proyección de pensión ----
  const edadPensionFinal = edadPension || (sexo === "Femenino" ? 60 : 65);
  const aniosRestantes = Math.max(edadPensionFinal - edad, 0);
  const factor1 = lookupFactor(FACTOR1, perfilRiesgo, aniosRestantes);
  const factor2 = lookupFactor(FACTOR2, perfilRiesgo, aniosRestantes);
  const divisorRV = lookupFactor3(edadPensionFinal, sexo) || 1;

  const saldoProyectado = (saldoAFP + saldoAPV) * factor1 + cotizAFP * factor2 + apvPesos * factor2;
  const pensionProyectada = divisorRV === 0 ? 0 : saldoProyectado / divisorRV;

  const brechaPension = Math.max(pensionDeseada - pensionProyectada, 0);
  const apvMensualNecesarioPesos = factor2 === 0 ? 0 : (brechaPension * divisorRV) / factor2;
  const apvMensualNecesarioUF = ufValor === 0 ? 0 : apvMensualNecesarioPesos / ufValor;

  return {
    sinApv, regA, regB,
    pension: {
      aniosRestantes, factor1, factor2, divisorRV,
      saldoProyectado, pensionProyectada,
      apvMensualNecesarioUF, edadPensionFinal,
    },
  };
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
function NumberField({ label, value, onChange, suffix, step = 1, min = 0, hint }) {
  // value=0 se muestra vacío (no "0" pegado que haya que borrar a mano).
  const display = value === 0 || value === null || value === undefined ? "" : String(value);
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <div style={styles.fieldInputWrap}>
        <input
          type="number"
          value={display}
          min={min}
          step={step}
          placeholder="0"
          onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
          style={styles.fieldInput}
        />
        {suffix && <span style={styles.fieldSuffix}>{suffix}</span>}
      </div>
      {hint && <span style={styles.fieldHint}>{hint}</span>}
    </label>
  );
}

function MoneyField({ label, value, onChange, hint, action }) {
  // Input de texto (no number) para poder mostrar separador de miles
  // mientras se escribe ("1.500.000") y nunca quedar con un 0 pegado.
  const display = value === 0 || value === null || value === undefined ? "" : CLP.format(value);
  function handleChange(e) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    onChange(digits === "" ? 0 : parseInt(digits, 10));
  }
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <div style={styles.fieldInputWrap}>
        <span style={styles.fieldSuffix}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          placeholder="0"
          onChange={handleChange}
          style={styles.fieldInput}
        />
      </div>
      {hint && <span style={styles.fieldHint}>{hint}</span>}
      {action}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.fieldSelect}>
        {options.map((o) => (
          <option key={o} value={o}>{o.replace("AFP ", "")}</option>
        ))}
      </select>
    </label>
  );
}

function ResultRow({ label, a, b, fmt = clp, highlight }) {
  return (
    <tr style={highlight ? styles.resultRowHighlight : undefined}>
      <td style={styles.resultLabel}>{label}</td>
      <td style={styles.resultCell}>{fmt(a)}</td>
      <td style={{ ...styles.resultCell, ...styles.resultCellB }}>{fmt(b)}</td>
    </tr>
  );
}

function APVSimulator() {
  const econ = useIndicadores();

  const [rentaBruta, setRentaBruta] = useState(1500000);
  const [pagoSalud, setPagoSalud] = useState(Math.round(1500000 * 0.07));
  const [pagoSaludManual, setPagoSaludManual] = useState(false);
  const [edad, setEdad] = useState(40);
  const [sexo, setSexo] = useState("Masculino");
  const [afp, setAfp] = useState(AFP_LIST[0]);
  const [apvUF, setApvUF] = useState(5);

  const [perfilRiesgo, setPerfilRiesgo] = useState("Moderado");
  const [saldoAFP, setSaldoAFP] = useState(0);
  const [saldoAPV, setSaldoAPV] = useState(0);
  const [edadPension, setEdadPension] = useState(0); // 0 = usar default por sexo
  const [pensionDeseada, setPensionDeseada] = useState(1000000);

  // Resultados al instante: usa el valor en vivo si ya llegó, o el de
  // respaldo mientras tanto — nunca se espera a la red para mostrar números.
  const ufValor = econ.uf ?? FALLBACK_UF;
  const utmValor = econ.utm ?? FALLBACK_UTM;

  // Sugerencia automática del pago de salud mínimo (7% de la renta bruta,
  // tope imponible 90 UF — igual que la cotización de salud real), mientras
  // el usuario no haya escrito un monto a mano.
  useEffect(() => {
    if (!pagoSaludManual) setPagoSalud(Math.round(Math.min(rentaBruta, 90 * ufValor) * 0.07));
  }, [rentaBruta, ufValor, pagoSaludManual]);

  const result = useMemo(() => {
    return calcular({
      ufValor, utmValor, rentaBruta, pagoSalud, edad, sexo, afp, apvUF,
      perfilRiesgo, saldoAFP, saldoAPV, edadPension, pensionDeseada,
    });
  }, [ufValor, utmValor, rentaBruta, pagoSalud, edad, sexo, afp, apvUF,
      perfilRiesgo, saldoAFP, saldoAPV, edadPension, pensionDeseada]);

  const rentaMinimaRegB = 4781420;
  const saludMinima = Math.round(Math.min(rentaBruta, 90 * ufValor) * 0.07);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerRow}>
          <div style={styles.headerLeft}>
            <div style={styles.logoMark}>
              <img src="icons/icon-192.png" alt="RNCO" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <h1 style={styles.title}>
                <span style={styles.logoBR}>RNCO</span> <span style={styles.logoWord}>APV Simulator</span>
              </h1>
              <div style={styles.subtitle}>Régimen A vs. Régimen B · Proyección de pensión</div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="ft-card" style={styles.card}>
          <div style={styles.cardTitle}>Datos del cliente</div>
          <div style={styles.formGrid}>
            <MoneyField label="Renta bruta mensual" value={rentaBruta} onChange={setRentaBruta} />
            <MoneyField
              label="Pago salud (Isapre)"
              value={pagoSalud}
              onChange={(v) => { setPagoSalud(v); setPagoSaludManual(true); }}
              hint={`Mínimo legal (7%): ${clp(saludMinima)}`}
              action={pagoSaludManual && (
                <button type="button" onClick={() => { setPagoSaludManual(false); setPagoSalud(saludMinima); }} style={styles.linkButton}>
                  usar mínimo (7%)
                </button>
              )}
            />
            <NumberField label="Edad" value={edad} onChange={setEdad} min={18} step={1} />
            <SelectField label="Sexo" value={sexo} onChange={setSexo} options={["Masculino", "Femenino"]} />
            <SelectField label="AFP" value={afp} onChange={setAfp} options={AFP_LIST} />
            <NumberField label="Aporte APV mensual" value={apvUF} onChange={setApvUF} suffix="UF" step={0.5} hint={`≈ ${clp(apvUF * ufValor)} / mes`} />
          </div>
          {rentaBruta > 0 && rentaBruta < rentaMinimaRegB && (
            <div style={styles.warning}>
              <Info size={14} />
              <span>Con esta renta, el Régimen B normalmente no conviene (la base tributaria ya es muy baja) — referencia: {clp(rentaMinimaRegB)}.</span>
            </div>
          )}
        </div>

        {/* Proyección de pensión */}
        <div className="ft-card" style={styles.card}>
          <div style={styles.cardTitle}>Proyección de pensión</div>
          <div style={styles.formGrid}>
            <SelectField label="Perfil de riesgo" value={perfilRiesgo} onChange={setPerfilRiesgo} options={PERFILES} />
            <MoneyField label="Saldo actual AFP" value={saldoAFP} onChange={setSaldoAFP} />
            <MoneyField label="Saldo actual APV + DC" value={saldoAPV} onChange={setSaldoAPV} />
            <NumberField label="Edad de pensión (opcional)" value={edadPension} onChange={setEdadPension} step={1} hint="vacío = usar default (60 mujer / 65 hombre)" />
            <MoneyField label="Pensión mensual deseada" value={pensionDeseada} onChange={setPensionDeseada} />
          </div>

          {result && (
            <div style={styles.pensionGrid}>
              <div style={styles.pensionStat}>
                <span style={styles.pensionStatLabel}>Años restantes</span>
                <span style={styles.pensionStatValue}>{result.pension.aniosRestantes}</span>
              </div>
              <div style={styles.pensionStat}>
                <span style={styles.pensionStatLabel}>Pensión proyectada</span>
                <span style={styles.pensionStatValue}>{clp(result.pension.pensionProyectada)}</span>
              </div>
              <div style={{ ...styles.pensionStat, ...styles.pensionStatAccent }}>
                <span style={styles.pensionStatLabel}>APV mensual necesario</span>
                <span style={styles.pensionStatValue}>{uf(result.pension.apvMensualNecesarioUF)}</span>
                {ufValor > 0 && <span style={styles.pensionStatSub}>≈ {clp(result.pension.apvMensualNecesarioUF * ufValor)} / mes</span>}
              </div>
            </div>
          )}
          <div style={styles.footnote}>Proyección referencial: capitaliza el saldo actual y los aportes mensuales (AFP + APV) según el perfil de riesgo elegido, y los convierte a renta vitalicia mensual según tablas de esperanza de vida por edad y sexo. No reemplaza una certificación de tu AFP.</div>
        </div>

        {/* Comparación de beneficios (Régimen A vs B) */}
        {result && rentaBruta > 0 && (
          <div className="ft-card" style={styles.card}>
            <div style={styles.cardTitle}>Comparación de beneficios</div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.resultTable}>
                <thead>
                  <tr>
                    <th style={styles.resultHeadLabel}></th>
                    <th style={styles.resultHead}>Régimen A</th>
                    <th style={{ ...styles.resultHead, ...styles.resultHeadB }}>Régimen B</th>
                  </tr>
                </thead>
                <tbody>
                  <ResultRow label="Renta bruta mensual" a={result.regA.rentaBruta} b={result.regB.rentaBruta} />
                  <ResultRow label="Cotización AFP (10% + comisión)" a={-result.regA.cotizAFP} b={-result.regB.cotizAFP} />
                  <ResultRow label="Cotización salud (7%)" a={-result.regA.cotizSalud} b={-result.regB.cotizSalud} />
                  <ResultRow label="Seguro de cesantía" a={-result.regA.cotizCesantia} b={-result.regB.cotizCesantia} />
                  <ResultRow label="Aporte APV" a={-result.regA.apv} b={-result.regB.apv} />
                  <ResultRow label="Renta afecta a impuesto" a={result.regA.rentaAfecta} b={result.regB.rentaAfecta} highlight />
                  <ResultRow label="Impuesto único" a={-result.regA.impuesto} b={-result.regB.impuesto} />
                  <ResultRow label="Adicional Isapre" a={-result.regA.adicionalIsapre} b={-result.regB.adicionalIsapre} />
                  <ResultRow label="Renta líquida mensual" a={result.regA.rentaLiquida} b={result.regB.rentaLiquida} highlight />
                  <tr><td colSpan={3} style={{ height: 8 }}></td></tr>
                  <ResultRow label="Tramo de impuesto" a={result.regA.tramoTasa} b={result.regB.tramoTasa} fmt={pct} />
                  <ResultRow label="Beneficio APV mensual" a={result.regA.beneficioMensual} b={result.regB.beneficioMensual} />
                  <ResultRow label="Aporte neto del cliente" a={result.regA.aporteCliente} b={result.regB.aporteCliente} />
                  <ResultRow label="Rentabilidad inmediata" a={result.regA.rentabilidadInmediata} b={result.regB.rentabilidadInmediata} fmt={pct} highlight />
                  <ResultRow label="Beneficio APV anual" a={result.regA.beneficioAnual} b={result.regB.beneficioAnual} />
                </tbody>
              </table>
            </div>
            <div style={styles.footnote}>* El beneficio de Régimen B se calcula como el ahorro de impuesto efectivo, con tope de 600 UF/año. Régimen A: bonificación estatal de 15% del aporte, con tope de 6 UTM/año.</div>
          </div>
        )}

        <div style={styles.pageFooter}>RNCO APV Simulator — UF/UTM en vivo vía mindicador.cl. Cálculos referenciales, no constituyen asesoría tributaria ni previsional.</div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ft-card { transition: border-color 0.2s ease; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { opacity: 1; }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", color: "#e7e9ec", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: "calc(env(safe-area-inset-top, 0px) + 20px) 16px calc(env(safe-area-inset-bottom, 0px) + 48px)", boxSizing: "border-box" },
  container: { maxWidth: 980, margin: "0 auto" },

  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, borderBottom: "1px solid #232a33", paddingBottom: 18, marginBottom: 20 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 46, height: 46, borderRadius: 13, background: "#0a0a0a", border: "1px solid #232a33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4, boxShadow: "0 4px 14px rgba(0,0,0,0.25)" },
  title: { margin: 0, fontSize: 22, lineHeight: 1.2 },
  logoBR: { color: "#4d8eff", fontWeight: 800, letterSpacing: "-0.02em" },
  logoWord: { color: "#e7e9ec", fontWeight: 700 },
  subtitle: { color: "#8a929d", fontSize: 13, marginTop: 2 },

  ribbon: { display: "flex", gap: 18, flexWrap: "wrap" },
  ribbonItem: { display: "flex", flexDirection: "column", gap: 2, background: "#13171d", border: "1px solid #232a33", borderRadius: 10, padding: "8px 14px", minWidth: 110 },
  ribbonLabel: { fontSize: 10.5, letterSpacing: "0.06em", color: "#6f7785", textTransform: "uppercase" },
  ribbonValue: { fontSize: 15, fontWeight: 700, color: "#e7e9ec" },
  ribbonStatus: { fontSize: 11, color: "#6f7785", display: "flex", alignItems: "center", gap: 6 },

  card: { background: "#13171d", border: "1px solid #232a33", borderRadius: 16, padding: "20px 22px", marginBottom: 18 },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#e7e9ec" },

  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 12, color: "#8a929d" },
  fieldInputWrap: { display: "flex", alignItems: "center", background: "#0e1116", border: "1px solid #2a313c", borderRadius: 10, overflow: "hidden" },
  fieldInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#e7e9ec", fontSize: 14, padding: "10px 12px", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  fieldSuffix: { color: "#6f7785", fontSize: 12, padding: "0 12px" },
  fieldSelect: { background: "#0e1116", border: "1px solid #2a313c", borderRadius: 10, color: "#e7e9ec", fontSize: 14, padding: "10px 12px", fontFamily: "inherit", outline: "none" },
  fieldHint: { fontSize: 11, color: "#5b94ff" },
  linkButton: { background: "none", border: "none", color: "#5b94ff", fontSize: 11, cursor: "pointer", padding: 0, textAlign: "left", textDecoration: "underline" },

  warning: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14, padding: "10px 12px", background: "#1a1410", border: "1px solid #3a2f1f", borderRadius: 10, fontSize: 12.5, color: "#dbb27a" },

  resultTable: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 },
  resultHeadLabel: { textAlign: "left", padding: "6px 4px" },
  resultHead: { textAlign: "right", padding: "6px 4px", color: "#8a929d", fontWeight: 600, fontSize: 11.5 },
  resultHeadB: { color: "#4d8eff" },
  resultLabel: { padding: "7px 4px", color: "#aab1bb", borderTop: "1px solid #1d2229" },
  resultCell: { padding: "7px 4px", textAlign: "right", borderTop: "1px solid #1d2229", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  resultCellB: { color: "#cfe0ff" },
  resultRowHighlight: { background: "#171c24" },

  footnote: { fontSize: 11.5, color: "#5b6270", marginTop: 14, lineHeight: 1.5 },

  pensionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 18 },
  pensionStat: { background: "#0e1116", border: "1px solid #2a313c", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  pensionStatAccent: { borderColor: "#2c4a82", background: "#10182a" },
  pensionStatLabel: { fontSize: 11.5, color: "#8a929d" },
  pensionStatValue: { fontSize: 19, fontWeight: 800 },
  pensionStatSub: { fontSize: 11.5, color: "#6f7785" },

  pageFooter: { textAlign: "center", color: "#4d5562", fontSize: 11.5, marginTop: 24 },
};

// Mount into #root
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<APVSimulator />);
