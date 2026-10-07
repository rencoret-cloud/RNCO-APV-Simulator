const { useState, useEffect, useMemo } = React;

// Logo MetLife (Blue 950 background) embebido como base64
const METLIFE_LOGO_B64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAB4ARgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD4Xooor70/MgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArRtf8AkAal/wBfFp/Kas6tG1/5AGpf9fFp/Kah7FQ3M6iiigkKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACtG1/wCQBqX/AF8Wn8pqzq0bX/kAal/18Wn8pqHsVDczqKKKCQooooAKKKKACiiigAorv/A/wO+IHxH8NXfifwdYWt9DZXJtZbc3Sxzlwgb5VbAYYYd81yGueH9c8M6hJpPiHSLvTbyP70F1EY3A9cHqPccU/MhVISbinqjPoorX8L+EPFPjbVU0Twh4fv8AWL9+fIs4DIyj+8xHCj3Yge9RUqQpRc5tJLq9EWk27IyKK9E+JnwG+Inwh0bSNZ8d2NlZDWZpYYLaK8WeZGjUM3mBMqvDDoxrzussNiqGMp+2w81KLvqndaaFShKDtJBRRkdNwz6ZorckKKMgdTigEHkUAFFFFABRRRQAUUZHY0UAFFJuXO3cM+meaUDJAHUnA9zQFgorQv8Aw94g0q3S61TQdTsoJeElubKWJH+jMoB/Cs+hNPYbi46MKKKKBBRRRQAUUUUAFaNr/wAgDUv+vi0/lNWdWja/8gDUv+vi0/lNQ9iobmdRRRQSFFFFABRRRQAUUUDrQB9n/sTYPw51z/sNn/0RHXsnjr4feE/iPozaJ4t0qO7iwfJlHyz2zf3opOqn26HuDXif7Fs/lfD3Wlz11on/AMgR19FpKrgY616tGEfYpyR8jjajp4ucouzTPjPT/wBj3xZN8TZPDN7fMnheFRdHWUQAywFsCJVPAn4II6D73IIB+0Ph/wCFvDHw40KPw74P0a306yXBcRjMkzf35X+9I3ufwwOKljXbzmrMTY71+c8WUPrsfZX91dOg6maYmck1K1ux83f8FALn7R4Z8Fc526je/wDomOvit/uN/un+VfY/7eLE+HPB3P8AzELz/wBFJXxw33H/AN1v5V6HCtBYfK4U10b/ADZ9Jgq8sTQjUnu/8z9vtC+Ffw/+K37Kfg34deMbOzjg8TeDtLt45FjRbhbgWMciywnGTIhTzB/uHPGa/G/4r/DLxN8HPiDrXw48YQCLUtFuDE7gERzxEbo50z/A6EMPTODyDX6M/tWeMPEPw+/Yp+BHjfwnqDWWsaJfeGLyznX+F10qXhh3VhlWXurEd67W2+G3wR/b30T4a/tDahGlrceH5jHrungBhOIgXfTrg54RJ9sit3idh0kyJwmIlhE6k9YNv5Nf5n2mNw0MdalHScUn6p7/AHHNf8E6f2ZtN+G3gmH4sfEGwtk8UeOIdmk2l4i77XTtpkVVVv8AlpKE81u4RUHHzV8Vft8Qw2/7W3xChgijijS4ssKihVH+g2/YcV9b+Af2lf8Ahf8A/wAFBdA0vw3eb/BPhHTNZstHCcJdy/ZyJrzHo5G1PSNQeNxrl5fg3oPxo/4KheM9K8V2Ud9ougRQa7d2cozHdGKztEiicd0MkiMw6EIQeCa0oVZ0cRKtW6xvbtrsZYmjTr4aFDD7c1r99NWfHPg79mr4/fEDRk8ReDfhB4o1TS5V3xXkVkUimX1jaQr5g91yK5DVvBHjLQPEw8F654V1bT9faaO3Gl3NnJHdNI7bUURMAxLEgLgcnpmv0++PsP8AwUg1v4m36/BPRofD3grSphb6RHbXul7ryJAB58wmJb5jnEeFCrgYzk0z9rfwv451f9lPwz8efiV4X03QPi58NbzT9Skkg8udFdbxI2TKsytE5MUwjyQrDHrW8Mxm5Rvy2l2eq7XOaplVNRly81491o+9jxL4L/sHab4n/Zn8Z+OfiL4B8baf8Q9M/tT+xtNYy2rz+VbI1ti2KZk3SFh/tYxXx/4z+E/xR+H2mx6n47+HfiPw7a3TNBBNqemy2ySS7C2xWcAFsAnA7A1+pf7O/wC0f8WfiJ+xt8Q/jL4p1qyn8UeHv7a+wXEVhHFEn2azjli3RD5Ww7EnPUcV+dXxu/aw+NX7QPh6z8O/E/XNOv7LTLhr62W202K2ZZvKZMlk5I2u3FGEq4mVScZWsnrrt6BjqOEhSpuDadtNN/U+xv8Agp9Y2Vr8DPhY9tZwQs+ojcY4lUn/AEDvgc1+bakA9M1+lf8AwVF/5IV8Kv8AsIj/ANIK/NUffH1rfKv93Xq/zOfOV/tXyX5H2tdfFfww3/BPlPAp/Zy8Sx3ItVh/4ShtDQaQJxdYOoi++95hYbcYzuJTO2u9/wCCaf7NeoaX4j8S/FH4q/DfU7G80mC0j8OLq+mugPmh3luIVkGGYKsaqw6bzjG6r+pAN/wSBtlIJDWkYIz2OuV6N/wTx/aE+KPxr8GeNx8QNXs7v/hFTYWumfZ7GO38uMwSkhtv3/8AVpyfQ+tefWnNYep7NWXM09XfoerQpweJpe1d3yprRdn+R86ftX/tUftJePPht4g8E/Ez9nq48H+Edbv4IrC/vLC8gniaKcTRI0kv7uSRliOQFX+LHSvmPwL+z18cfibpn9t+AfhV4k1vTSSFvbazIt3I6hJHKq+P9kmvon4UfGP4u/tzfFzwb8EPjZrmnal4Th1Ntfvra20yK2eVbOCRvLLp82192wj0c9wK+n/2k7D9vi88br4d/Zr8O2vhzwHolvBBYS2N1psL3jBAWJSYkxxqTsWMKowhJzkY3hXeDtQSjGT1d3p/w5zSw8cdfESlKUVorLX/AIZH5YeMPA3jL4faw/h/xz4W1XQNTRd5tNRtXgkKdmAYfMv+0Mj3rDr9XP2gfh58Rvin+w7q2t/tHeEtP034k+B4J9UgvLaSGTeIGBMimElUE0G5XjBxuUNgYXH5SMACQPWu/B4n6zBt7p2dtvkeZj8H9Umktmrq+/zEooorrOEKKKKACtG1/wCQBqX/AF8Wn8pqzq0bX/kAal/18Wn8pqHsVDczqKKKCQooooAKKKKACiiimB9b/sfT+V4D1hf+ouf/AESlfRFnc5IJPX3r4J+F3xw1r4XaZeaTY6LZX8F3cC5/fyOjI+0KcFeoIArv4f2y/E0OMeB9Ib63c1dzxMFQUFufNYzLcTWxEqkFo/NH2jC4dBirCmvjSH9uHxVDwPAGinHreT1MP26fFYP/ACT3RP8AwMnr5bHYKriL8qMP7JxXZfejp/27SD4c8HD0v7z/ANFJXx233H/3W/lXqfxo+P2vfGiDS7TU9B0/S4NKeWVFtpHkMjuACSX6ABeAK8trsy3DzwuGVOe+v5n0OBoyw9CMJ7q/5n6W/tv5/wCHfnwf4P3/AA32/wCoTLXwj4A+OPxH+GfhDxh4H8Ia9JZ6V43s0s9TjGcgA8vEQfkdoy0TN3RyOoUjkLvxBr1/ZR6bf65qNzaQ7fKt57uSSKPaMLtRmKrgcDA4HFZ9Vh8IqVN05663PaxWNdaqqtPTSx9R/wDBNb/k7Lw/gf8AMK1XAA/6djXr2v8Axv0b4C/8FN/GPibxVO1toGrJBouqXG0n7NFNY2jJOQOSqSRoWxztLEZxXwPYajqGlXAvNLv7mzuFBVZraZonAPUBlIIz9abeX17qN097qF5cXVxIQXmnlaSRiBgZZiSeABye1TUwSq1ZTk9HGxVLHujRjTitYy5rn6iftAfsu/tM+PvGN38Sv2cP2i9SuPDPiRhfx6a3iu7t4bZnHzfZpIi8TwE5ZQNu3dgZAFfP/wC0P+z5+0N8I/gbfeJ/jl+0XqGrzX17Z2dt4XTXrq8hug0mXeQzsofy9oYKiNggEkYr5Y8M/Er4ieCoGtfB3j3xHoUDklotN1We2jJPfbGwXP4Vl654h1/xPfHVPEuuahq16wwbm/upLiXHpvkJOPxrOjg61NpOSsvLU2rY+hVUpKD5n/e0P0T/AOCdOo6H8S/2Zvid+zyusQWevX8moMiyH5vs17aJCs4Xq6pIhDY6ZXONwr5h+N37Dfxj+AXw5vviL8Qr/wANrYW95Bp8UNheSXEs7y7gHAMahVG3PJzyOK8F0rV9V0K/h1XRNUvNOvrc7obm0neGaM+quhDD8DWt4n+Inj/xssaeM/HPiDXkhOY01PU57pUPqFkYgH3xWkcNVp1pTpy92Tu1YyljKNWhGFWD5oqydz9cf2rf2YfFX7T3wq8B+HvC/iLS9Gm0SSO+mfUYpmV1a0EYVfLBOcnPNfInir/gll8VvCfhnV/FV58S/Cc8GjWFxqEsUVtd75EhjaQqpK4yQuBmvkRfHPjZFCJ4y19VUYAGq3AAHp9+my+NvGc8TwT+MNekjkUo6PqlwyspGCCC+CMdqxoYPE0I8sKit6HRXx2DxEuepTfNbufoXfZb/gkFZsFODZwt07HXKb/wSYBPg74sgKSTc6d0Gf8Al3uK/Os6/rh0waKdb1E6cBgWf2uTyMZz/q92zrz0680abr2uaMkiaRreo2CzEGRbW7khD46bgjDPU9aqWAbozpc3xO5EcyjGvCty/DHl/A9L/ZZ+L1l8C/j14Y+I2rRySaVZzy2upiNdzi0nRopHVRySm4PgddmO9foD+0P+z/8AHP42a3D8Yv2Wf2jL46Hr9vFK+lxeJ7u3sw6oF821eEsgVgAWjIUhgxzyQPykre8MePvHXgkufBvjXX9BMpzINM1Ka1Dn1IjYAn3NaYjBupNVabtJaaq6ZlhcdGjTdGqm4t30dmmfYPxd/Zq/ae+GfwN8V+O/jl+0pqLW8FokFt4ci8RXd4NTkkmRDFIZmRCu1mYoquTt7DNfEB6mtXxF4s8U+L7sah4s8S6rrd0owJtRvZblwPZpGJH4VlVvh6U6UXztNvsrHPiq1OtJezTSXd3YUUUVucoUUUUAFaNr/wAgDUv+vi0/lNWdWja/8gDUv+vi0/lNQ9iobmdRRRQSFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABWja/8AIA1L/r4tP5TVnVo2v/IA1L/r4tP5TUPYqG5nUUUUEhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVo2v/ACANS/6+LT+U1Z1aNr/yANS/6+LT+U1D2KhuZ1FFFBIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFaNr/wAgDUv+vi0/lNRRQ9iobmdRRRQSf//Z";

function Info({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Paleta MetLife (Brand Book 2024)
// ---------------------------------------------------------------------------
const ML = {
  blue950:   "#003652",
  blue700:   "#005580",
  blue400:   "#0090D4",
  blue200:   "#CBF1FF",
  green400:  "#8FF5B1",
  green600:  "#28A745",
  warmGray200: "#F5F2ED",
  warmGray400: "#C8C4BE",
  text:      "#FFFFFF",
  textMuted: "#CBF1FF",
  border:    "rgba(255,255,255,0.15)",
};

// ---------------------------------------------------------------------------
// Tablas de impuestos (tramos en UTM)
// ---------------------------------------------------------------------------
const TAX_BRACKETS_UTM = [
  { hastaUTM: 13.5,     tasa: 0,     rebajaUTM: 0 },
  { hastaUTM: 30,       tasa: 0.04,  rebajaUTM: 37740.06   / 71506 },
  { hastaUTM: 50,       tasa: 0.08,  rebajaUTM: 121606.86  / 71506 },
  { hastaUTM: 70,       tasa: 0.135, rebajaUTM: 313801.61  / 71506 },
  { hastaUTM: 90,       tasa: 0.23,  rebajaUTM: 778563.46  / 71506 },
  { hastaUTM: 120,      tasa: 0.304, rebajaUTM: 1244024.2  / 71506 },
  { hastaUTM: 310,      tasa: 0.35,  rebajaUTM: 1629811.48 / 71506 },
  { hastaUTM: Infinity, tasa: 0.4,   rebajaUTM: 2713090.98 / 71506 },
];

const AFP_RATES = {
  "AFP CAPITAL": 0.0144, "AFP CUPRUM": 0.0144, "AFP HABITAT": 0.0127,
  "AFP MODELO": 0.0058,  "AFP PLANVITAL": 0.0116, "AFP PROVIDA": 0.0145, "AFP UNO": 0.0046,
};
const AFP_LIST = Object.keys(AFP_RATES);
const PERFILES = ["Muy Arriesgado", "Moderado", "Muy Conservador"];

const FACTOR1 = {
  "Muy Arriesgado":   [1.05,1.1,1.15,1.2,1.26,1.32,1.38,1.44,1.51,1.58,1.66,1.74,1.82,1.9,1.99,2.09,2.18,2.29,2.39,2.51,2.62,2.75,2.88,3.01,3.15,3.3,3.46,3.62,3.79,3.97,4.15,4.35,4.55,4.77,4.99,5.22,5.47,5.73,6,6.28,6.57,6.88,7.21,7.54,7.9,8.27],
  "Moderado":         [1.03,1.06,1.09,1.13,1.16,1.2,1.23,1.27,1.31,1.35,1.39,1.43,1.48,1.52,1.57,1.62,1.67,1.72,1.77,1.82,1.88,1.94,2,2.06,2.12,2.18,2.25,2.32,2.39,2.46,2.54,2.62,2.7,2.78,2.86,2.95,3.04,3.13,3.23,3.33,3.43,3.53,3.64,3.75,3.87,3.98],
  "Muy Conservador":  [1.02,1.04,1.05,1.06,1.1,1.13,1.15,1.17,1.2,1.22,1.24,1.27,1.29,1.32,1.35,1.37,1.4,1.43,1.46,1.49,1.52,1.55,1.58,1.61,1.64,1.67,1.71,1.74,1.78,1.81,1.85,1.88,1.92,1.96,2,2.04,2.08,2.12,2.16,2.21,2.25,2.3,2.34,2.39,2.44,2.49],
};
const FACTOR2 = {
  "Muy Arriesgado":   [12,26,40,54,70,87,105,124,145,167,190,215,241,269,299,331,364,400,439,480,523,570,619,671,727,787,851,918,990,1057,1149,1236,1328,1427,1532,1644,1763,1890,2025,2470,2323,2486,2660,2846,3043,3253],
  "Moderado":         [12,25,33,52,67,82,98,115,132,150,169,189,210,232,255,278,303,329,336,384,414,445,477,511,546,583,621,661,703,747,793,841,891,943,998,1055,1115,1177,1242,1311,1382,1456,1534,1615,1700,1789],
  "Muy Conservador":  [12,24,37,50,53,76,90,104,118,133,147,162,178,193,209,226,242,259,277,294,312,331,349,368,388,408,428,449,470,491,513,536,558,582,606,630,654,680,705,731,758,785,813,842,871,900],
};
const FACTOR3 = {
  ages: [50,55,60,65,70,75],
  Hombre: [280,251,220,188,156,124],
  Mujer:  [310,284,255,224,191,157],
};

function lookupFactor(table, perfil, years) {
  const arr = table[perfil];
  if (!arr || years < 1) return 0;
  return arr[Math.min(Math.round(years), arr.length) - 1] || arr[arr.length - 1];
}
function lookupFactor3(edad, sexo) {
  const arr = sexo === "Masculino" ? FACTOR3.Hombre : FACTOR3.Mujer;
  let idx = 0;
  for (let i = 0; i < FACTOR3.ages.length; i++) if (FACTOR3.ages[i] <= edad) idx = i;
  return arr[idx];
}
function impuestoUnico(rentaAfecta, utm) {
  if (rentaAfecta <= 0) return { impuesto: 0, tasa: 0 };
  const rentaUTM = rentaAfecta / utm;
  let bracket = TAX_BRACKETS_UTM[0];
  for (const b of TAX_BRACKETS_UTM) { if (rentaUTM <= b.hastaUTM) { bracket = b; break; } bracket = b; }
  return { impuesto: Math.max(0, rentaAfecta * bracket.tasa - bracket.rebajaUTM * utm), tasa: bracket.tasa };
}
function calcularApvParaBajarTramo(rentaAfectaSinApv, utmValor, ufValor) {
  const rentaUTM = rentaAfectaSinApv / utmValor;
  let idx = 0;
  for (let i = 0; i < TAX_BRACKETS_UTM.length; i++) {
    if (rentaUTM <= TAX_BRACKETS_UTM[i].hastaUTM) { idx = i; break; }
    idx = i;
  }
  if (idx === 0) return null;
  const limiteEnPesos      = TAX_BRACKETS_UTM[idx-1].hastaUTM * utmValor;
  const apvNecesarioPesosReal = Math.max(0, rentaAfectaSinApv - limiteEnPesos);
  const apvNecesarioUFReal    = ufValor > 0 ? apvNecesarioPesosReal / ufValor : 0;
  const TOPE_UF_MES = 50;
  const topado = apvNecesarioUFReal > TOPE_UF_MES;
  return {
    tramoActual: TAX_BRACKETS_UTM[idx].tasa,
    tramoDestino: TAX_BRACKETS_UTM[idx-1].tasa,
    apvNecesarioPesos: topado ? TOPE_UF_MES * ufValor : apvNecesarioPesosReal,
    apvNecesarioUF:    topado ? TOPE_UF_MES            : apvNecesarioUFReal,
    limiteEnPesos, topado, apvNecesarioUFReal,
  };
}

const FALLBACK_UF  = 40801.29;
const FALLBACK_UTM = 71506;
const CLP = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
const clp  = n => (!isFinite(n) || n == null) ? "—" : "$" + CLP.format(Math.round(n));
const pct  = (n, d=1) => (!isFinite(n) || n == null) ? "—" : (n*100).toFixed(d)+"%";
const uf   = n => (!isFinite(n) || n == null) ? "—" : n.toFixed(2)+" UF";

function useIndicadores() {
  const [s, set] = useState({ status: "loading", uf: null, utm: null });
  useEffect(() => {
    let alive = true;
    fetch("https://mindicador.cl/api")
      .then(r => r.json())
      .then(d => { if (alive) set({ status:"ok", uf: d.uf?.valor, utm: d.utm?.valor }); })
      .catch(()  => { if (alive) set(p => ({ ...p, status:"error" })); });
    return () => { alive = false; };
  }, []);
  return s;
}

function calcular({ ufValor, utmValor, rentaBruta, pagoSalud, edad, sexo, afp, apvUF, perfilRiesgo, saldoAFP, saldoAPV, edadPension, pensionDeseada }) {
  const afpRate = AFP_RATES[afp] ?? 0;
  const tope90  = 90 * ufValor;
  const cotizAFP      = Math.min(rentaBruta, tope90) * (0.10 + afpRate);
  const cotizSalud    = Math.min(rentaBruta, tope90) * 0.07;
  const cotizCesantia = Math.min(rentaBruta, 135.2 * ufValor) * 0.006;
  const apvPesos      = apvUF * ufValor;

  const sinApv = { rentaBruta, cotizAFP, cotizSalud, cotizCesantia, apv: 0 };
  sinApv.rentaAfecta = rentaBruta - cotizAFP - cotizSalud - cotizCesantia;
  const tSin = impuestoUnico(sinApv.rentaAfecta, utmValor);
  sinApv.impuesto = tSin.impuesto;
  sinApv.adicionalIsapre = pagoSalud - cotizSalud;
  sinApv.rentaLiquida = sinApv.rentaAfecta - sinApv.impuesto - sinApv.adicionalIsapre;

  const regA = { ...sinApv, apv: apvPesos };
  const tA = impuestoUnico(sinApv.rentaAfecta, utmValor);
  regA.impuesto = tA.impuesto;
  regA.rentaLiquida = sinApv.rentaAfecta - tA.impuesto - sinApv.adicionalIsapre - apvPesos;
  regA.beneficioMensual = Math.min(apvPesos * 0.15, (6 * utmValor) / 12);
  regA.aporteCliente = apvPesos;
  regA.rentabilidadInmediata = apvPesos === 0 ? 0 : regA.beneficioMensual / apvPesos;
  regA.tramoTasa = tA.tasa;
  regA.beneficioAnual = regA.beneficioMensual * 12;

  const regB = { ...sinApv, apv: apvPesos };
  regB.rentaAfecta = rentaBruta - cotizAFP - cotizSalud - cotizCesantia - apvPesos;
  const tB = impuestoUnico(regB.rentaAfecta, utmValor);
  regB.impuesto = tB.impuesto;
  regB.rentaLiquida = regB.rentaAfecta - tB.impuesto - sinApv.adicionalIsapre;
  regB.beneficioMensual = Math.max(0, Math.min(sinApv.impuesto - regB.impuesto, (600 * ufValor) / 12));
  regB.aporteCliente = apvPesos - regB.beneficioMensual;
  regB.rentabilidadInmediata = regB.aporteCliente === 0 ? 0 : regB.beneficioMensual / regB.aporteCliente;
  regB.tramoTasa = tB.tasa;
  regB.beneficioAnual = regB.beneficioMensual * 12;

  const edadPF  = edadPension || (sexo === "Femenino" ? 60 : 65);
  const anios   = Math.max(edadPF - edad, 0);
  const f1 = lookupFactor(FACTOR1, perfilRiesgo, anios);
  const f2 = lookupFactor(FACTOR2, perfilRiesgo, anios);
  const divisorRV = lookupFactor3(edadPF, sexo) || 1;
  // Cotización que efectivamente capitaliza en la cuenta individual = 10% del
  // imponible (tope 90 UF). La comisión AFP es un costo, no acumula en el fondo.
  // Fórmula corregida por el usuario: MIN(rentaBruta, 90*UF) * 10%
  const cotiz10pct = Math.min(rentaBruta, 90 * ufValor) * 0.10;

  const saldoProyectado = divisorRV === 0 ? 0
    : (saldoAFP + saldoAPV) * f1 + cotiz10pct * f2 + apvPesos * f2;
  const pensionProyectada = divisorRV === 0 ? 0 : saldoProyectado / divisorRV;
  const brechaPension = Math.max(pensionDeseada - pensionProyectada, 0);
  const apvMensualNecesarioUF = f2 === 0 ? 0 : (brechaPension * divisorRV) / f2 / ufValor;

  const bajarTramo = calcularApvParaBajarTramo(sinApv.rentaAfecta, utmValor, ufValor);

  return { sinApv, regA, regB, bajarTramo, pension: { anios, saldoProyectado, pensionProyectada, apvMensualNecesarioUF, edadPF } };
}

// ---------------------------------------------------------------------------
// Componentes de formulario
// ---------------------------------------------------------------------------
function MoneyField({ label, value, onChange, hint, action }) {
  const display = !value ? "" : CLP.format(value);
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      <div style={S.fieldWrap}>
        <span style={S.fieldPre}>$</span>
        <input type="text" inputMode="numeric" value={display} placeholder="0"
          onChange={e => onChange(parseInt(e.target.value.replace(/\D/g,""))||0)} style={S.fieldInput} />
      </div>
      {hint   && <span style={S.fieldHint}>{hint}</span>}
      {action}
    </label>
  );
}
function NumberField({ label, value, onChange, suffix, step=1, min=0, hint }) {
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      <div style={S.fieldWrap}>
        <input type="number" value={value||""} min={min} step={step} placeholder="0"
          onChange={e => onChange(e.target.value===""?0:parseFloat(e.target.value))} style={S.fieldInput} />
        {suffix && <span style={S.fieldPre}>{suffix}</span>}
      </div>
      {hint && <span style={S.fieldHint}>{hint}</span>}
    </label>
  );
}
function SelectField({ label, value, onChange, options }) {
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} style={S.fieldSelect}>
        {options.map(o=><option key={o} value={o}>{o.replace("AFP ","")}</option>)}
      </select>
    </label>
  );
}
function ResultRow({ label, a, b, fmt=clp, highlight }) {
  return (
    <tr style={highlight ? S.trHighlight : undefined}>
      <td style={S.tdLabel}>{label}</td>
      <td style={S.tdCell}>{fmt(a)}</td>
      <td style={{...S.tdCell, color: ML.green400, fontWeight:600}}>{fmt(b)}</td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// App principal
// ---------------------------------------------------------------------------
function APVSimulator() {
  const econ = useIndicadores();
  const ufValor  = econ.uf  ?? FALLBACK_UF;
  const utmValor = econ.utm ?? FALLBACK_UTM;

  const [rentaBruta,      setRentaBruta]      = useState(1500000);
  const [pagoSalud,       setPagoSalud]       = useState(0);
  const [pagoSaludManual, setPagoSaludManual] = useState(false);
  const [edad,            setEdad]            = useState(40);
  const [sexo,            setSexo]            = useState("Masculino");
  const [afp,             setAfp]             = useState(AFP_LIST[0]);
  const [apvUF,           setApvUF]           = useState(0);
  const [perfilRiesgo,    setPerfilRiesgo]    = useState("Muy Arriesgado");
  const [saldoAFP,        setSaldoAFP]        = useState(0);
  const [saldoAPV,        setSaldoAPV]        = useState(0);
  const [edadPension,     setEdadPension]     = useState(0);
  const [pensionDeseada,  setPensionDeseada]  = useState(1500000);

  const saludMinima = Math.round(Math.min(rentaBruta, 90*ufValor)*0.07);
  useEffect(() => { if (!pagoSaludManual) setPagoSalud(saludMinima); }, [rentaBruta, ufValor, pagoSaludManual]);

  const result = useMemo(()=>calcular({ ufValor, utmValor, rentaBruta, pagoSalud, edad, sexo, afp, apvUF, perfilRiesgo, saldoAFP, saldoAPV, edadPension, pensionDeseada }),
    [ufValor,utmValor,rentaBruta,pagoSalud,edad,sexo,afp,apvUF,perfilRiesgo,saldoAFP,saldoAPV,edadPension,pensionDeseada]);

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLogoWrap}>
            <img src={METLIFE_LOGO_B64} alt="MetLife" style={S.headerLogo} />
          </div>
          <div style={S.headerText}>
            <h1 style={S.headerTitle}>Simulador APV</h1>
            <div style={S.headerSub}>
              <span style={S.statusDot} title={econ.status==="ok"?"UF/UTM en vivo":econ.status==="error"?"Sin conexión":"Conectando…"}>
                <span style={{...S.dot, ...(econ.status==="ok"?S.dotOk:econ.status==="error"?S.dotErr:S.dotWait)}} />
                {econ.status==="ok"?"en vivo":econ.status==="error"?"sin conexión":"conectando…"}
              </span>
            </div>
          </div>
        </div>

        {/* Card: Datos del cliente */}
        <div style={S.card}>
          <div style={S.cardTitle}>Datos del cliente</div>
          <div style={S.grid}>
            <MoneyField label="Renta bruta mensual" value={rentaBruta} onChange={setRentaBruta}
              hint={result ? `Líquido estimado (sin APV): ${clp(result.sinApv.rentaLiquida)}` : undefined} />
            <MoneyField label="Pago salud (Isapre)" value={pagoSalud}
              onChange={v=>{setPagoSalud(v);setPagoSaludManual(true);}}
              hint={`Mínimo legal (7%): ${clp(saludMinima)}`}
              action={pagoSaludManual && <button style={S.linkBtn} onClick={()=>{setPagoSaludManual(false);setPagoSalud(saludMinima);}}>usar mínimo (7%)</button>} />
            <NumberField label="Edad" value={edad} onChange={setEdad} min={18} step={1} />
            <SelectField label="Sexo" value={sexo} onChange={setSexo} options={["Masculino","Femenino"]} />
            <SelectField label="AFP" value={afp} onChange={setAfp} options={AFP_LIST} />
            <NumberField label="Aporte APV mensual" value={apvUF} onChange={setApvUF} suffix="UF" step={0.5}
              hint={`≈ ${clp(apvUF*ufValor)} / mes`} />
          </div>
        </div>

        {/* Card: Proyección de pensión */}
        <div style={S.card}>
          <div style={S.cardTitle}>Proyección de pensión</div>
          <div style={S.grid}>
            <SelectField label="Perfil de riesgo" value={perfilRiesgo} onChange={setPerfilRiesgo} options={PERFILES} />
            <MoneyField label="Saldo actual AFP"     value={saldoAFP}       onChange={setSaldoAFP} />
            <MoneyField label="Saldo actual APV + DC" value={saldoAPV}      onChange={setSaldoAPV} />
            <NumberField label="Edad de pensión (0 = default)" value={edadPension} onChange={setEdadPension} step={1} />
            <MoneyField label="Pensión mensual deseada" value={pensionDeseada} onChange={setPensionDeseada} />
          </div>

          {result && (
            <div style={S.statGrid}>
              <div style={S.stat}><span style={S.statLabel}>Años restantes</span><span style={S.statVal}>{result.pension.anios}</span></div>
              <div style={S.stat}><span style={S.statLabel}>Pensión proyectada</span><span style={S.statVal}>{clp(result.pension.pensionProyectada)}</span></div>
              <div style={{...S.stat,...S.statAccent}}>
                <span style={S.statLabel}>APV mensual necesario</span>
                <span style={{...S.statVal,color:ML.green400}}>{uf(result.pension.apvMensualNecesarioUF)}</span>
                <span style={S.statSub}>≈ {clp(result.pension.apvMensualNecesarioUF*ufValor)} / mes</span>
              </div>
            </div>
          )}

          {result && result.bajarTramo && (
            <div style={S.tramoCaja}>
              <div style={S.tramoTitulo}>Régimen B · aporte para bajar de tramo tributario</div>
              <div style={S.tramoFila}><span style={S.tramoLabel}>Tramo actual</span><span style={S.tramoVal}>{pct(result.bajarTramo.tramoActual)}</span></div>
              <div style={S.tramoFila}><span style={S.tramoLabel}>Tramo destino</span><span style={S.tramoVal}>{result.bajarTramo.topado?"No alcanzable con el tope legal":pct(result.bajarTramo.tramoDestino)}</span></div>
              <div style={{...S.tramoFila,...S.tramoFilaHighlight}}>
                <span style={S.tramoLabel}>APV mensual (Rég. B)</span>
                <div style={{textAlign:"right"}}>
                  <span style={S.tramoMonto}>{uf(result.bajarTramo.apvNecesarioUF)}</span>
                  <div style={S.tramoSub}>≈ {clp(result.bajarTramo.apvNecesarioPesos)} / mes</div>
                  {!result.bajarTramo.topado && <div style={S.tramoSub}>Renta afecta quedaría en {clp(result.bajarTramo.limiteEnPesos)}</div>}
                </div>
              </div>
              {result.bajarTramo.topado && (
                <div style={S.tramoAlerta}>⚠ Para bajar de tramo se necesitarían {uf(result.bajarTramo.apvNecesarioUFReal)} mensuales, pero el Régimen B tiene un tope de 600 UF/año (50 UF/mes). Con el máximo permitido se obtiene la mayor rebaja posible dentro del mismo tramo.</div>
              )}
            </div>
          )}
          {result && !result.bajarTramo && rentaBruta>0 && (
            <div style={{...S.tramoCaja, color: ML.textMuted, fontSize:13}}>Ya estás en el tramo exento. No hay tramo anterior al cual bajar.</div>
          )}

          <div style={S.footnote}>Proyección referencial según tablas de capitalización y renta vitalicia. No reemplaza una proyección certificada por la AFP.</div>
        </div>

        {/* Card: Comparación A vs B */}
        {result && rentaBruta>0 && (
          <div style={S.card}>
            <div style={S.cardTitle}>Comparación de beneficios</div>
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}></th>
                    <th style={S.th}>Régimen A</th>
                    <th style={{...S.th,color:ML.green400}}>Régimen B</th>
                  </tr>
                </thead>
                <tbody>
                  <ResultRow label="Renta bruta" a={result.regA.rentaBruta} b={result.regB.rentaBruta} />
                  <ResultRow label="Cotización AFP" a={-result.regA.cotizAFP} b={-result.regB.cotizAFP} />
                  <ResultRow label="Cotización salud (7%)" a={-result.regA.cotizSalud} b={-result.regB.cotizSalud} />
                  <ResultRow label="Seguro cesantía" a={-result.regA.cotizCesantia} b={-result.regB.cotizCesantia} />
                  <ResultRow label="Aporte APV" a={-result.regA.apv} b={-result.regB.apv} />
                  <ResultRow label="Renta afecta a impuesto" a={result.regA.rentaAfecta} b={result.regB.rentaAfecta} highlight />
                  <ResultRow label="Impuesto único" a={-result.regA.impuesto} b={-result.regB.impuesto} />
                  <ResultRow label="Adicional Isapre" a={-result.regA.adicionalIsapre} b={-result.regB.adicionalIsapre} />
                  <ResultRow label="Renta líquida mensual" a={result.regA.rentaLiquida} b={result.regB.rentaLiquida} highlight />
                  <tr><td colSpan={3} style={{height:8}}></td></tr>
                  <ResultRow label="Tramo tributario" a={result.regA.tramoTasa} b={result.regB.tramoTasa} fmt={pct} />
                  <ResultRow label="Beneficio APV mensual" a={result.regA.beneficioMensual} b={result.regB.beneficioMensual} />
                  <ResultRow label="Aporte neto cliente" a={result.regA.aporteCliente} b={result.regB.aporteCliente} />
                  <ResultRow label="Rentabilidad inmediata" a={result.regA.rentabilidadInmediata} b={result.regB.rentabilidadInmediata} fmt={pct} highlight />
                  <ResultRow label="Beneficio APV anual" a={result.regA.beneficioAnual} b={result.regB.beneficioAnual} />
                </tbody>
              </table>
            </div>
            <div style={S.footnote}>Rég. A: bonificación estatal 15%, tope 6 UTM/año. Rég. B: ahorro de impuesto, tope 600 UF/año.</div>
          </div>
        )}

        <div style={S.pageFooter}>Simulador APV · Desarrollado por RNCO · Datos UF/UTM en vivo vía Banco Central de Chile. Cálculos referenciales, no constituyen asesoría tributaria ni previsional.</div>
      </div>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.35} }
        input,select { color: #003652; }
        input::placeholder { color: #7a9bb5; }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estilos (MetLife brand: Blue 950 base, Green 400 accent)
// ---------------------------------------------------------------------------
const S = {
  page:   { minHeight:"100vh", background: ML.blue950, color: ML.text, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", padding:"calc(env(safe-area-inset-top,0px) + 20px) 16px calc(env(safe-area-inset-bottom,0px) + 48px)" },
  container: { maxWidth:980, margin:"0 auto" },

  header: { display:"flex", alignItems:"center", gap:20, borderBottom:`1px solid ${ML.border}`, paddingBottom:20, marginBottom:24, flexWrap:"wrap" },
  headerLogoWrap: { borderRadius:14, overflow:"hidden", flexShrink:0, height:80, background: ML.blue950 },
  headerLogo: { height:80, width:"auto", display:"block" },
  headerText: { flex:1 },
  headerTitle: { margin:0, fontSize:22, fontWeight:800, letterSpacing:"-0.02em", color: ML.text },
  headerSub:  { fontSize:13, color: ML.textMuted, marginTop:3, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" },
  statusDot:  { display:"inline-flex", alignItems:"center", gap:5, fontSize:11.5, color: ML.warmGray400 },
  dot:        { width:7, height:7, borderRadius:"50%", display:"inline-block" },
  dotOk:      { background: ML.green400, boxShadow:`0 0 6px ${ML.green400}99` },
  dotWait:    { background:"#e3b341", animation:"pulse 1s ease-in-out infinite" },
  dotErr:     { background:"#e07a5f" },

  card:       { background:"rgba(255,255,255,0.06)", border:`1px solid ${ML.border}`, borderRadius:16, padding:"20px 22px", marginBottom:18 },
  cardTitle:  { fontSize:15, fontWeight:700, marginBottom:16, color: ML.text, borderLeft:`3px solid ${ML.green400}`, paddingLeft:10 },

  grid:       { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 },
  field:      { display:"flex", flexDirection:"column", gap:6 },
  fieldLabel: { fontSize:12, color: ML.textMuted, fontWeight:500 },
  fieldWrap:  { display:"flex", alignItems:"center", background:"rgba(255,255,255,0.9)", border:`1px solid rgba(0,0,0,0.1)`, borderRadius:10, overflow:"hidden" },
  fieldInput: { flex:1, background:"transparent", border:"none", outline:"none", fontSize:14, padding:"10px 12px", fontFamily:"inherit" },
  fieldPre:   { color:"#5a7a90", fontSize:13, padding:"0 10px", background:"rgba(0,54,82,0.06)", alignSelf:"stretch", display:"flex", alignItems:"center" },
  fieldSelect:{ background:"rgba(255,255,255,0.9)", border:`1px solid rgba(0,0,0,0.1)`, borderRadius:10, fontSize:14, padding:"10px 12px", fontFamily:"inherit", color:"#003652", outline:"none", width:"100%" },
  fieldHint:  { fontSize:11, color: ML.green400 },
  linkBtn:    { background:"none", border:"none", color: ML.blue200, fontSize:11, cursor:"pointer", padding:0, textDecoration:"underline", textAlign:"left", marginTop:2 },

  statGrid:   { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginTop:18 },
  stat:       { background:"rgba(255,255,255,0.07)", border:`1px solid ${ML.border}`, borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", gap:4 },
  statAccent: { borderColor: ML.green400+"66", background:"rgba(143,245,177,0.07)" },
  statLabel:  { fontSize:11.5, color: ML.textMuted },
  statVal:    { fontSize:19, fontWeight:800 },
  statSub:    { fontSize:11.5, color: ML.warmGray400 },

  tramoCaja:  { marginTop:14, background:"rgba(143,245,177,0.06)", border:`1px solid ${ML.green400}44`, borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", gap:6 },
  tramoTitulo:{ fontSize:12.5, fontWeight:700, color: ML.green400, marginBottom:4 },
  tramoFila:  { display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13 },
  tramoFilaHighlight: { marginTop:8, paddingTop:8, borderTop:`1px solid ${ML.green400}33` },
  tramoLabel: { color: ML.textMuted },
  tramoVal:   { color: ML.text, fontWeight:600 },
  tramoMonto: { fontSize:20, fontWeight:800, color: ML.green400 },
  tramoSub:   { fontSize:11.5, color: ML.warmGray400, textAlign:"right", marginTop:2 },
  tramoAlerta:{ fontSize:12, color:"#dbb27a", background:"rgba(219,178,122,0.1)", border:"1px solid rgba(219,178,122,0.3)", borderRadius:8, padding:"8px 10px", marginTop:10, lineHeight:1.5 },

  table:      { width:"100%", borderCollapse:"collapse", fontSize:12.5 },
  th:         { textAlign:"right", padding:"6px 8px", color: ML.textMuted, fontWeight:600, fontSize:11.5 },
  tdLabel:    { padding:"7px 8px", color: ML.textMuted, borderTop:`1px solid ${ML.border}` },
  tdCell:     { padding:"7px 8px", textAlign:"right", borderTop:`1px solid ${ML.border}`, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" },
  trHighlight:{ background:"rgba(255,255,255,0.04)" },

  footnote:   { fontSize:11.5, color: ML.warmGray400, marginTop:14, lineHeight:1.5 },
  pageFooter: { textAlign:"center", color: ML.warmGray400, fontSize:11.5, marginTop:24, opacity:0.7 },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<APVSimulator />);
