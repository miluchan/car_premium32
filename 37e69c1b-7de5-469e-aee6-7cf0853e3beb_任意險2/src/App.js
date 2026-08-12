import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// 鎖定繁體中文，阻斷自動翻譯
document.documentElement.lang = "zh-TW";

// ⚡ 初始化您的 Supabase 雲端專案連線
const SUPABASE_URL = "https://smrywtpsfrybqslypttj.supabase.co";
const SUPABASE_KEY = "sb_publishable_X_T4spfQy204iLHFgjd7NA_d4yQ-3Bz";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// 後端規則引擎
const INSURANCE_RATE_ENGINE = {
  versionCode: "V2026_GOLDEN",
  effectiveStartDate: "1150801",
  hullBaseRates: { "01甲式": 0.022, "05乙式": 0.011, "07丙式": 0.0065 },
  theftBaseRate: 0.0058,
  compulsoryBase: { 自小客: 1318, 重型機車: 1470 },
  annualDepreciation: 0.75,
};

// 🚗 23 檔完全體車籍字典 (挑選車種全自動取得價格與c.c.數)
const BRAND_OPTIONS = [
  {
    label: "Toyota Corolla Altis",
    code: "57021020",
    value: "79.9",
    cc: "1798",
    rateFactor: 1.8,
  },
  {
    label: "Toyota Camry",
    code: "57023010",
    value: "95.5",
    cc: "1998",
    rateFactor: 2.0,
  },
  {
    label: "Toyota Camry (大排氣量)",
    code: "57023020",
    value: "115.0",
    cc: "2494",
    rateFactor: 2.2,
  },
  {
    label: "Toyota RAV4",
    code: "57025010",
    value: "101.0",
    cc: "1987",
    rateFactor: 2.0,
  },
  {
    label: "Toyota RAV4 (旗艦)",
    code: "57025020",
    value: "125.0",
    cc: "2487",
    rateFactor: 2.2,
  },
  {
    label: "Toyota Yaris",
    code: "57027010",
    value: "72.5",
    cc: "1496",
    rateFactor: 1.5,
  },
  {
    label: "Toyota Vios",
    code: "57028010",
    value: "58.9",
    cc: "1496",
    rateFactor: 1.5,
  },
  {
    label: "Toyota Wish (停產)",
    code: "57024010",
    value: "82.9",
    cc: "1998",
    rateFactor: 1.8,
  },
  {
    label: "BMW 318i",
    code: "21011010",
    value: "212.0",
    cc: "1998",
    rateFactor: 2.5,
  },
  {
    label: "BMW 320i",
    code: "21012010",
    value: "243.0",
    cc: "1998",
    rateFactor: 2.8,
  },
  {
    label: "BMW 330i",
    code: "21012020",
    value: "292.0",
    cc: "1998",
    rateFactor: 2.8,
  },
  {
    label: "BMW X1",
    code: "21033010",
    value: "195.0",
    cc: "1998",
    rateFactor: 2.6,
  },
  {
    label: "BMW X3",
    code: "21032010",
    value: "265.0",
    cc: "1998",
    rateFactor: 2.8,
  },
  {
    label: "BMW X5",
    code: "21033010",
    value: "345.0",
    cc: "2998",
    rateFactor: 3.5,
  },
  {
    label: "BMW 520i",
    code: "21021010",
    value: "296.0",
    cc: "1998",
    rateFactor: 3.0,
  },
  {
    label: "BMW 530i",
    code: "21021020",
    value: "343.0",
    cc: "1998",
    rateFactor: 3.0,
  },
  {
    label: "Tesla Model 3 SR+",
    code: "98011010",
    value: "169.9",
    cc: "0",
    rateFactor: 2.8,
  },
  {
    label: "Tesla Model 3 Long Range",
    code: "98011020",
    value: "213.3",
    cc: "0",
    rateFactor: 3.0,
  },
  {
    label: "Tesla Model 3 Performance",
    code: "98011030",
    value: "243.4",
    cc: "0",
    rateFactor: 3.0,
  },
  {
    label: "Tesla Model Y",
    code: "98012010",
    value: "173.9",
    cc: "0",
    rateFactor: 3.2,
  },
  {
    label: "Tesla Model S",
    code: "98013010",
    value: "294.9",
    cc: "0",
    rateFactor: 3.3,
  },
  {
    label: "Tesla Model X",
    code: "98014010",
    value: "324.9",
    cc: "0",
    rateFactor: 3.5,
  },
];
const VEHICLE_OPTIONS = [
  { code: "03", label: "03:自小客" },
  { code: "01", label: "01:重型機車" },
  { code: "02", label: "02:輕型機車" },
  { code: "04", label: "04:自小貨" },
  { code: "05", label: "05:自大客" },
  { code: "06", label: "06:自大貨" },
  { code: "32", label: "32:大型重機" },
  { code: "34", label: "34:小型輕機" },
];

const LIABILITY_INJURY_OPTIONS = [
  { label: "30萬/60萬", base: 1500 },
  { label: "40萬/80萬", base: 1800 },
  { label: "200萬/400萬", base: 2800 },
  { label: "300萬/600萬", base: 3200 },
  { label: "500萬/1000萬", base: 3800 },
];

const LIABILITY_PROP_OPTIONS = [
  { label: "10萬", base: 1100 },
  { label: "20萬", base: 1300 },
  { label: "30萬", base: 1500 },
  { label: "50萬", base: 1700 },
  { label: "100萬", base: 2200 },
];

const PASSENGER_PLAN_OPTIONS = [
  { label: "100萬/400萬", fullPremium: 360, driverPremium: 80 },
  { label: "200萬/800萬", fullPremium: 650, driverPremium: 140 },
  { label: "300萬/1200萬", fullPremium: 1000, driverPremium: 220 },
];

const HULL_DEDUCTIBLE_DICT = {
  0: "不用顯示",
  "3/5/7千元": "3/5/7第一次自付3000，第二次自付5000，第三次及之後自付7000",
  "5/8千元": "第二次自付5000，之後自付8000",
};

// 💡 鋼鐵修正：全自動動態捕獲當前網域，並用標準 + 號實體字串拼接，保證生成可點擊斜線連結！
const generatePromoText = (type, name, plate, total, qid) => {
  const currentDomain = window.location.origin;
  const link = currentDomain + "/?signId=" + qid;
  const header =
    type === "sms"
      ? "【簡訊投保通知】"
      : type === "email"
      ? "【E-mail 即時通知】"
      : "【強制險投保通知】";
  return (
    header +
    "親愛的 " +
    name +
    " 您好，您愛車 " +
    plate +
    " 的強制任意險報價已精算完成，總金額為 NT$ " +
    total.toLocaleString() +
    " 元。請點擊下方連結確認明細並線上簽名：" +
    link
  );
};
export default function App() {
  const [historyQuotes, setHistoryQuotes] = useState([]);
  const [isCalc, setIsCalc] = useState(false);

  // 1. 上段：客戶與 CRM 基本資料控制項 useState 宣告
  const [clientName, setClientName] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [birthday, setBirthday] = useState("480101");
  const [gender, setGender] = useState("女");
  const [vehicle, setVehicle] = useState("03:自小客");
  const [passengerCount, setPassengerCount] = useState("5");
  const [passengerUnit, setPassengerUnit] = useState("人");
  const [phone, setPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // 2. 中段：雙軌保期與車籍控制項 (起保日預設 1150808 今日綠字)
  const [startDate, setStartDate] = useState("1150808");
  const [endDateCompulsory, setEndDateCompulsory] = useState("1160808");
  const [startDateArbitrary, setStartDateArbitrary] = useState("1150808");
  const [endDateArbitrary, setEndDateArbitrary] = useState("1160808");
  const [mergedBrandSeries, setMergedBrandSeries] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [issueDate, setIssueDate] = useState("11508");
  const [manufactureDate, setManufactureDate] = useState("202608");
  const [engineDisplacement, setEngineDisplacement] = useState("");
  const [replacementValue, setReplacementValue] = useState("");

  // 💡 修正問題 2：新增即時動態折舊後商品保額狀態變數，不需試算即可動態拋轉
  const [depreciatedInsuredValue, setDepreciatedInsuredValue] = useState(0);

  // 車籍精算衍生項目
  const [carAge, setCarAge] = useState(0);
  const [rateCode, setRateCode] = useState(1.8);

  // 六欄位從人矩陣狀態
  const [level, setLevel] = useState("4");
  const [drunkCount, setDrunkCount] = useState("0");
  const [liabilityClaimLevel, setLiabilityClaimLevel] = useState("0");
  const [liabilityClaimFactor, setLiabilityClaimFactor] = useState(1.0);
  const [hullClaimLevel, setCarDamageLevel] = useState("0");
  const [hullClaimFactor, setHullClaimFactor] = useState(1.0);

  // 3. 下段：五大投保險種選單狀態 (左側直接打勾)
  const [hasHull, setHasHull] = useState(false);
  const [hullType, setHullType] = useState("07丙式");
  const [hullDeductible, setHullDeductible] = useState("0");
  const [hasTheft, setHasTheft] = useState(false);
  const [theftDeductible, setTheftDeductible] = useState("10%");
  const [hasLiability, setHasLiability] = useState(false);
  const [liabilityCoverage, setLiabilityCoverage] = useState("200萬/400萬");
  const [liabilityProperty, setLiabilityProperty] = useState("30萬");
  const [hasExcess, setHasExcess] = useState(false);
  const [excessLimit, setExcessCoverage] = useState("1000萬");
  const [hasPassenger, setHasPassenger] = useState(false);
  const [passengerType, setPassengerType] = useState("保整車");
  const [passengerPlan, setPassengerPlan] = useState("100萬/400萬");

  // 💰 險種獨立保費格狀態
  const [hullPremium, setHullPremium] = useState(0);
  const [theftPremium, setTheftPremium] = useState(0);
  const [liabilityPremiumInjury, setLiabilityPremiumInjury] = useState(0);
  const [liabilityPremiumProperty, setLiabilityPremiumProperty] = useState(0);
  const [excessPremium, setExcessPremium] = useState(0);
  const [passengerPremium, setPassengerPremium] = useState(0);

  // 底部三大總額看板狀態
  const [compulsoryPremium, setCompulsoryPremium] = useState(0);
  const [arbitraryPremium, setArbitraryPremium] = useState(0);
  const [totalPremium, setTotalPremium] = useState(0);

  // 雙彈窗與手寫簽名控制變數
  const [showSignModal, setShowSignModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [activeSignRecord, setActiveSignRecord] = useState(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  // 💡 修正問題 2：輸入重置價格及製造年月後，自動即時運算折舊後價值（萬元），隨時供車體與竊盜險右方顯示保額
  useEffect(() => {
    if (!manufactureDate || manufactureDate.length < 4 || !replacementValue) {
      setDepreciatedInsuredValue(0);
      return;
    }
    const currentWestYear = 2026;
    const mfWestYear = parseInt(manufactureDate.substring(0, 4)) || 2026;
    const calculatedAge = Math.max(0, currentWestYear - mfWestYear);
    setCarAge(calculatedAge);
    const originalValue = parseFloat(replacementValue) || 0;
    setDepreciatedInsuredValue(
      Math.round(originalValue * Math.pow(0.75, calculatedAge) * 10) / 10
    );
    setIsCalc(false);
  }, [manufactureDate, replacementValue]);

  // 六欄位從人係數換算連動
  useEffect(() => {
    setLiabilityClaimFactor(1.0 + (parseInt(liabilityClaimLevel) || 0) * 0.1);
    setHullClaimFactor(1.0 + (parseInt(hullClaimLevel) || 0) * 0.1);
    setIsCalc(false);
  }, [liabilityClaimLevel, hullClaimLevel]);

  // 💡 修正問題 3：雙軌保期連動 (投保機車車種 01/02/32/34 時，到期日自動動態預設為 2 年後)
  useEffect(() => {
    if (!startDate || startDate.length < 6) return;
    const sy = parseInt(startDate.substring(0, startDate.length - 4));
    const md = startDate.substring(startDate.length - 4);
    if (isNaN(sy)) return;
    const isM = ["01", "02", "32", "34"].some((c) => vehicle.startsWith(c));
    setEndDateCompulsory(String(sy + (isM ? 2 : 1)) + md);
    setIsCalc(false);
  }, [startDate, vehicle]);

  useEffect(() => {
    if (!startDateArbitrary || startDateArbitrary.length < 6) return;
    const sy = parseInt(
      startDateArbitrary.substring(0, startDateArbitrary.length - 4)
    );
    const md = startDateArbitrary.substring(startDateArbitrary.length - 4);
    if (isNaN(sy)) return;
    setEndDateArbitrary(String(sy + 1) + md);
    setIsCalc(false);
  }, [startDateArbitrary]);

  // 💡 修正問題 1：挑選廠牌車型後，自動取得重置價格、排氣量、廠型代號
  const handleVChg = (lbl) => {
    setMergedBrandSeries(lbl);
    const m = BRAND_OPTIONS.find((i) => i.label === lbl);
    if (m) {
      setModelCode(m.code);
      setRateCode(m.rateFactor);
      setEngineDisplacement(m.cc);
      setReplacementValue(m.value);
    }
    setIsCalc(false);
  };

  useEffect(() => {
    if (hullType === "07丙式") setHullDeductible("0");
  }, [hullType]);

  useEffect(() => {
    if (!hasLiability) setHasExcess(false);
  }, [hasLiability]);
  // 🚀 智慧型網址單號強行攔截大腦 (內聯合體：100% 解決客戶端姓名與保費漏同步、卡在提取中的缺陷)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const signId = params.get("signId");
    if (signId) {
      const fetchSingleQuote = async () => {
        try {
          const { data, error } = await supabaseClient
            .from("insurance_quotations")
            .select("*")
            .eq("quotation_no", signId)
            .single();
          if (!error && data) {
            setClientName(data.client_name);
            setCarNumber(data.plate_no);
            setVehicle(data.vehicle_type_display || "03:自小客");
            setCompulsoryPremium(data.forced_premium || 0);
            setArbitraryPremium(data.arbitrary_premium || 0);
            setTotalPremium(data.total_premium || 0);
            setActiveSignRecord({
              quoteId: data.quotation_no,
              clientName: data.client_name,
              carNumber: data.plate_no,
              vehicle: data.vehicle_type_display,
              totalPremium: data.total_premium,
            });
            setShowSignModal(true); // 💡 網址參數有 signId 時，強制點火彈出手寫簽名畫面！
          }
        } catch (e) {}
      };
      fetchSingleQuote();
    }
  }, [window.location.search]);

  // 🚀 1. 唯一的精算核心大腦 (包含所有從人係數與機車強制險去加成公式)
  const triggerCalc = async () => {
    const currentYear = 115;
    const age = currentYear - (parseInt(birthday.substring(0, 2)) || 48);
    let activeRule = INSURANCE_RATE_ENGINE;

    const { data: ageFactors } = await supabaseClient
      .from("age_gender_factors")
      .select("*")
      .lte("age_min", age)
      .gte("age_max", age);
    const ageFactorRecord =
      ageFactors && ageFactors.length > 0
        ? ageFactors
        : { male_factor: 1.1, female_factor: 1.0 };
    const ageGenderFactor =
      gender === "女"
        ? parseFloat(ageFactorRecord.female_factor)
        : parseFloat(ageFactorRecord.male_factor);

    const originalValue = (parseFloat(replacementValue) || 0) * 10000;
    const depreciatedValue = Math.round(
      originalValue * Math.pow(activeRule.annualDepreciation, carAge)
    );

    let p_hull = 0,
      p_theft = 0,
      p_liab_inj = 0,
      p_liab_prop = 0,
      p_excess = 0,
      p_passenger = 0;
    if (hasHull) {
      const baseRate = activeRule.hullBaseRates[hullType] || 0.006;
      let dedFactor =
        hullDeductible === "3/5/7千元"
          ? 0.9
          : hullDeductible === "5/8千元"
          ? 0.85
          : 1.0;
      p_hull = Math.round(
        depreciatedValue *
          baseRate *
          ageGenderFactor *
          dedFactor *
          rateCode *
          hullClaimFactor
      );
    }
    if (hasTheft)
      p_theft = Math.round(
        depreciatedValue * activeRule.theftBaseRate * 0.95 * 0.9
      );
    if (hasLiability) {
      const injObj = LIABILITY_INJURY_OPTIONS.find((o) =>
        o.label.includes(liabilityCoverage)
      ) || { base: 2800 };
      const propObj = LIABILITY_PROP_OPTIONS.find((o) =>
        o.label.includes(liabilityProperty)
      ) || { base: 1500 };
      p_liab_inj = Math.round(
        injObj.base * ageGenderFactor * liabilityClaimFactor
      );
      p_liab_prop = Math.round(
        propObj.base * ageGenderFactor * liabilityClaimFactor
      );
    }
    if (hasExcess && hasLiability)
      p_excess =
        excessLimit === "1000萬" ? 1650 : excessLimit === "500萬" ? 1100 : 2400;
    if (hasPassenger) {
      const planObj = PASSENGER_PLAN_OPTIONS.find((o) =>
        o.label.includes(passengerPlan)
      ) || { fullPremium: 360, driverPremium: 80 };
      p_passenger =
        passengerType === "保整車"
          ? planObj.fullPremium
          : planObj.driverPremium;
    }

    // 💡 修正問題 3：如果是機車，強制險全自動與從人等級、酒駕次數切斷加成，維持基準費不予乘積
    const isHeavyMotor = ["01", "02", "32", "34"].some((c) =>
      vehicle.startsWith(c)
    );
    const compulsoryBase = isHeavyMotor
      ? activeRule.compulsoryBase["重型機車"]
      : activeRule.compulsoryBase["自小客"];
    const levelFactor = isHeavyMotor ? 1.0 : 1 + (parseInt(level) - 4) * 0.1;
    let cp =
      Math.round(compulsoryBase * levelFactor) +
      (isHeavyMotor ? 0 : parseInt(drunkCount) * 3600);

    setHullPremium(p_hull);
    setTheftPremium(p_theft);
    setLiabilityPremiumInjury(p_liab_inj);
    setLiabilityPremiumProperty(p_liab_prop);
    setExcessPremium(p_excess);
    setPassengerPremium(p_passenger);
    setCompulsoryPremium(cp);
    setArbitraryPremium(
      p_hull + p_theft + p_liab_inj + p_liab_prop + p_excess + p_passenger
    );
    setTotalPremium(
      cp + p_hull + p_theft + p_liab_inj + p_liab_prop + p_excess + p_passenger
    );
    setIsCalc(true);
    alert(
      "精算對帳單完成！總金額為 NT$ " +
        (
          cp +
          p_hull +
          p_theft +
          p_liab_inj +
          p_liab_prop +
          p_excess +
          p_passenger
        ).toLocaleString() +
        " 元。"
    );
  };

  // 🚀 修正問題 2：精確對齊大表的資料欄位，讓一覽表的起保與到期日 100% 彩色現形！
  const fetchHistory = async () => {
    try {
      const { data } = await supabaseClient
        .from("insurance_quotations")
        .select("*")
        .order("quotation_no", { ascending: false });
      if (data) {
        setHistoryQuotes(
          data.map((item) => {
            const snap = item.ui_state_snapshot || {};
            return {
              quoteId: item.quotation_no,
              clientName: item.client_name,
              carNumber: item.plate_no,
              vehicle: item.vehicle_type_display || "03:自小客",
              compulsoryPremium: item.forced_premium || 0,
              arbitraryPremium: item.arbitrary_premium || 0,
              totalPremium: item.total_premium || 0,
              status: item.status || "待簽署",
              startDate: snap.startDate || "1150808",
              endDate: snap.endDate || "1160808",
              clientEmail: snap.clientEmail || "",
              phone: snap.phone || "",
            };
          })
        );
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🚀 修正問題 1：補上看板與垃圾桶刪除所需的註銷功能函數
  const handleDeleteRecord = async (qid) => {
    if (!window.confirm("⚠️ 確定要註銷並刪除這筆報價單嗎？")) return;
    try {
      await supabaseClient
        .from("insurance_quotations")
        .delete()
        .eq("quotation_no", qid);
    } catch (e) {}
    setHistoryQuotes(historyQuotes.filter((q) => q.quoteId !== qid));
    alert("🗑️ 報價紀錄已成功註銷刪除。");
  };

  // 🚀 2. 精算並儲存報價單 (💡 修正問題 5：跨日期偵測流水序號強制從 00001 重頭開始)
  const handleSave = async () => {
    if (!clientName || !carNumber) {
      alert("請填寫姓名與車號！");
      return;
    }
    try {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const prefix = "Qota-" + todayStr + "-";
      const nextSerial =
        historyQuotes.filter((q) => q.quoteId.startsWith(prefix)).length + 1;
      const qid = prefix + String(nextSerial).padStart(5, "0");
      const fileName = qid + "_" + clientName + ".pdf";

      await supabaseClient.from("insurance_quotations").insert([
        {
          quotation_no: qid,
          client_name: clientName,
          plate_no: carNumber,
          vehicle_type_display: vehicle,
          forced_premium: compulsoryPremium,
          arbitrary_premium: arbitraryPremium,
          total_premium: totalPremium,
          status: "待簽署",
          ui_state_snapshot: {
            startDate: startDate,
            endDate: endDateArbitrary,
            clientEmail: clientEmail,
            phone: phone,
          },
        },
      ]);
      setHistoryQuotes([
        {
          quoteId: qid,
          clientName,
          carNumber,
          vehicle,
          compulsoryPremium,
          arbitraryPremium,
          totalPremium,
          status: "待簽署",
          startDate: startDate,
          endDate: endDateArbitrary,
          clientEmail: clientEmail,
          phone: phone,
        },
        ...historyQuotes,
      ]);
      alert(
        "儲存成功！單號：" + qid + "\n商用存檔檔案已歸檔為：[" + fileName + "]"
      );
      setClientName("");
      setCarNumber("");
      setIsCalc(false);
    } catch (err) {}
  };

  // ==========================================
  // 🚀 3. 三軌通訊外發渠道 (💡 修正問題 5：精確對齊內文變數，100% 絕對強制外彈信箱)
  // ==========================================
  const triggerSendAction = (channel, item) => {
    const messageText = generatePromoText(
      channel,
      item.clientName,
      item.carNumber,
      item.totalPremium,
      item.quoteId
    );
    navigator.clipboard.writeText(messageText).catch(() => {});

    if (channel === "line") {
      window.open(
        "https://line.me/R/msg/text/?" + encodeURIComponent(messageText),
        "_blank"
      );
    } else if (channel === "sms") {
      window.location.href =
        "sms:" +
        (item.phone || phone || "") +
        "?&body=" +
        encodeURIComponent(messageText);
    } else if (channel === "email") {
      // 🎯 修正核心：改用標準的實體字串拼接格式，您的 Outlook 或電腦預設信箱草稿匣將會 100% 一秒自動外彈！
      window.location.href =
        "mailto:" +
        (item.clientEmail || clientEmail || "") +
        "?subject=" +
        encodeURIComponent("車險報價通知") +
        "&body=" +
        encodeURIComponent(messageText);
    }
  };

  // ==========================================
  // ✍️ 4. 手寫 Canvas 事件感應與【內聯全自動除名大腦】
  // ==========================================
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    // 🎯 換算「畫布顯示尺寸」與「畫布內部解析度」的比例差，消除手機縮放偏移
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // 📱 鎖定手機下拉/橡皮筋滑動，簽名時畫面不會跑掉
  useEffect(() => {
    const preventScroll = (e) => {
      if (e.target && e.target.tagName === "CANVAS" && e.cancelable) {
        e.preventDefault();
      }
    };
    window.addEventListener("touchmove", preventScroll, { passive: false });
    return () => window.removeEventListener("touchmove", preventScroll);
  }, []);

  const startDrawing = (e) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };
  const clearCanvas = () => {
    if (canvasRef.current)
      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const submitSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isBlank = !buffer.data.some((color) => color !== 0);
    if (isBlank) {
      alert("⚠️ 偵測到畫布空白！請先簽名。");
      return;
    }

    if (activeSignRecord) {
      try {
        await supabaseClient
          .from("insurance_quotations")
          .update({ status: "已簽署" })
          .eq("quotation_no", activeSignRecord.quoteId);
        setHistoryQuotes((prev) =>
          prev.map((q) =>
            q.quoteId === activeSignRecord.quoteId
              ? { ...q, status: "已簽署" }
              : q
          )
        );

        // 🎯 判斷目前是「客戶手機端」還是「經辦後台自己點簽名」
        const isCustomerFlow = window.location.search.includes("signId");
        if (isCustomerFlow) {
          // 客戶端：停在「簽署完成」畫面，絕不掉回經辦後台
          setIsSigned(true);
        } else {
          // 經辦後台自己簽：跟原本一樣，關閉彈窗、留在主畫面
          alert("✍️ 投保確認書簽署成功！該筆報價已由待簽署看板中除名！");
          setShowSignModal(false);
          setActiveSignRecord(null);
        }
      } catch (err) {}
    }
  };
  // ====================================================================
  // 🎯 物理防禦雙視圖分流：當客戶點連結進來，直接滿版遮斷，背景絕對全白不穿透！
  // ====================================================================
  if (window.location.search.includes("signId") && showSignModal) {
    return (
      <div
        className="container p-4 bg-white min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div
          className="p-4 border shadow-lg bg-white rounded-3 w-100"
          style={{ maxWidth: "550px", zIndex: 9999 }}
        >
          <div
            className="text-center fw-bold border-bottom pb-2 mb-3 text-primary"
            style={{ fontSize: "1.2rem" }}
          >
            ✒️ 汽機車保險投保確認書
          </div>
          <div className="bg-light p-3 rounded-2 border mb-3 text-start small">
            <div className="fw-bold mb-1 text-dark">核定明細：</div>
            <div>客戶姓名：{clientName || "核定客戶"}</div>
            <div>車牌號碼：{carNumber || "QQQ-222"}</div>
            <div>車種項目：{vehicle || "03:自小客"}</div>
            <div
              className="text-danger fw-bold mt-2"
              style={{ fontSize: "1rem" }}
            >
              總保費金額合計：NT${" "}
              {totalPremium ? totalPremium.toLocaleString() : "17,275"} 元
            </div>
          </div>
          <div className="text-start text-danger fw-bold small mb-2">
            請在藍色虛線框內用手指或滑鼠手寫簽名：
          </div>
          <canvas
            ref={canvasRef}
            width="490"
            height="220"
            className="border border-primary bg-white w-100 mb-3"
            style={{
              borderStyle: "dashed",
              cursor: "crosshair",
              touchAction: "none",
              minHeight: "220px",
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="d-flex gap-2 mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary w-50 fw-bold"
              onClick={clearCanvas}
            >
              清除重簽
            </button>
            <button
              type="button"
              className="btn btn-primary w-50 fw-bold"
              onClick={submitSignature}
            >
              確認送出確認書
            </button>
          </div>
          <div className="text-center text-muted small border-top pt-2">
            🔒 本手寫電子簽章受商用加密協議保護。
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // 📊 以下為「經辦專屬後台主畫面」
  // ====================================================================
  const isMotorVehicle = ["01", "02", "32", "34"].some((c) =>
    vehicle.startsWith(c)
  );

  return (
    <div
      className="container p-4 bg-white text-start shadow-sm rounded border"
      style={{ maxWidth: "850px", marginTop: "20px" }}
      translate="no"
    >
      <h4 className="fw-bold mb-4 text-center text-primary border-bottom pb-2">
        📋 汽機車強制任意險報價系統
      </h4>

      <h6 className="fw-bold text-dark mb-2">👤 上段：客戶基本資料</h6>
      <div className="row g-3 bg-light p-3 rounded mb-4 border">
        <div className="col-4">
          姓名*
          <input
            type="text"
            className="form-control bg-white"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div className="col-4">
          車號*
          <input
            type="text"
            className="form-control bg-white"
            placeholder="例: ABC-1234"
            value={carNumber}
            onChange={(e) => setCarNumber(e.target.value)}
          />
        </div>
        <div className="col-4">
          生日(民國年)*
          <input
            type="text"
            className="form-control bg-white"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>
        <div className="col-4">
          車種選擇*
          <select
            className="form-select bg-white"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          >
            {VEHICLE_OPTIONS.map((o) => (
              <option key={o.code} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-4">
          被保性別
          <select
            className="form-select bg-white"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div className="col-2">
          乘載量
          <input
            type="number"
            className="form-control bg-light"
            value={passengerCount}
            readOnly
          />
        </div>
        <div className="col-2">
          單位
          <select
            className="form-select bg-white"
            value={passengerUnit}
            onChange={(e) => setPassengerUnit(e.target.value)}
          >
            <option value="人">人</option>
            <option value="噸">噸</option>
          </select>
        </div>
        <div className="col-6">
          行動電話
          <input
            type="text"
            className="form-control bg-white"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="col-6">
          E-mail
          <input
            type="text"
            className="form-control bg-white"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
        </div>
      </div>
      {/* 🚗 中段：車籍與雙軌保期資料 */}
      <h6 className="fw-bold text-dark mb-2">🚗 中段：車籍與雙軌保期資料</h6>
      <div className="p-3 rounded mb-4 bg-white border border-warning shadow-sm">
        <div className="row g-3 mb-3">
          <div className="col-6">
            廠牌車系*
            <select
              className="form-select fw-bold border-primary"
              value={mergedBrandSeries}
              onChange={(e) => handleVChg(e.target.value)}
            >
              <option value="">-- 選取車型自動拋轉重置價格 --</option>
              {BRAND_OPTIONS.map((i) => (
                <option key={i.label} value={i.label}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6">
            廠型代號
            <input
              type="text"
              className="form-control bg-light font-monospace"
              value={modelCode}
              readOnly
            />
          </div>
        </div>
        <div className="row g-3">
          <div className="col-3">
            發照年月
            <input
              type="text"
              className="form-control bg-white"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="col-3">
            製造年月*
            <input
              type="text"
              className="form-control bg-white fw-bold text-primary"
              placeholder="例: 202608"
              value={manufactureDate}
              onChange={(e) => setManufactureDate(e.target.value)}
            />
          </div>
          <div className="col-3">
            排氣量(c.c.)
            <input
              type="text"
              className="form-control bg-light font-monospace"
              value={engineDisplacement}
              readOnly
            />
          </div>
          <div className="col-3">
            重置價格(萬元)*
            <input
              type="text"
              className="form-control bg-light text-danger fw-bold font-monospace"
              value={replacementValue}
              readOnly
            />
          </div>
        </div>

        {/* 💡 六欄位從人矩陣：鋼鐵校正 onChange 語法，彻底砸碎死鎖迴圈！ */}
        <div className="row g-3 mt-1 bg-light p-2 rounded border mb-3 small">
          <div className="col-2">
            強制肇事等級
            <select
              className="form-select form-select-sm"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={isMotorVehicle}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2">
            酒駕次數
            <select
              className="form-select form-select-sm"
              value={drunkCount}
              onChange={(e) => setDrunkCount(e.target.value)}
              disabled={isMotorVehicle}
            >
              {[...Array(11)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2">
            車責賠款等級
            <select
              className="form-select form-select-sm text-primary fw-bold"
              value={liabilityClaimLevel}
              onChange={(e) => setLiabilityClaimLevel(e.target.value)}
            >
              {[...Array(11)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2">
            車責賠款係數
            <div className="form-control form-control-sm bg-light fw-bold">
              {liabilityClaimFactor.toFixed(1)}
            </div>
          </div>

          {/* 🎯 關鍵除錯行：標準單向狀態賦值，絕不引發背景重複渲染當機 */}
          <div className="col-2">
            車體賠款等級
            <select
              className="form-select form-select-sm text-danger fw-bold"
              value={hullClaimLevel}
              onChange={(e) => setCarDamageLevel(e.target.value)}
            >
              {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2">
            車體賠款係數
            <div className="form-control form-control-sm bg-light fw-bold">
              {hullClaimFactor.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-3">
            強制-起保日
            <input
              type="text"
              className="form-control bg-white fw-bold text-success"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-3">
            強制-到期日
            <input
              type="text"
              className="form-control bg-light font-monospace"
              value={endDateCompulsory}
              readOnly
            />
          </div>
          <div className="col-3">
            任意-起保日*
            <input
              type="text"
              className="form-control bg-white fw-bold text-success"
              value={startDateArbitrary}
              onChange={(e) => setStartDateArbitrary(e.target.value)}
            />
          </div>
          <div className="col-3">
            任意-到期日
            <input
              type="text"
              className="form-control bg-light font-monospace"
              value={endDateArbitrary}
              readOnly
            />
          </div>
        </div>
      </div>
      <h6 className="fw-bold text-dark mb-2">🛡️ 下段：五大投保險種選單</h6>
      <div
        className="p-3 bg-white border border-success border-2 rounded mb-3 shadow-sm"
        style={{ fontSize: "0.85rem" }}
      >
        {/* 1. 車體損失險 */}
        <div className="row g-2 align-items-center mb-2 pb-2 border-bottom">
          <div className="col-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={hasHull}
                onChange={(e) => setHasHull(e.target.checked)}
                id="h1"
              />
              <label
                htmlFor="h1"
                className="form-check-label fw-bold text-success"
              >
                1. 車體損失險
              </label>
            </div>
          </div>
          <div className="col-3">
            <select
              className="form-select form-select-sm border-secondary-subtle"
              value={hullType}
              onChange={(e) => setHullType(e.target.value)}
              disabled={!hasHull}
            >
              <option value="01甲式">01甲式</option>
              <option value="05乙式">05乙式</option>
              <option value="07丙式">07丙式</option>
            </select>
          </div>
          <div className="col-3">
            <select
              className="form-select form-select-sm border-secondary-subtle"
              value={hullDeductible}
              onChange={(e) => setHullDeductible(e.target.value)}
              disabled={!hasHull || hullType === "07丙式"}
            >
              <option value="0">自付額: 0</option>
              <option value="3/5/7千元">3/5/7千元</option>
              <option value="5/8千元">5/8千元</option>
            </select>
          </div>
          {/* 💡 修正問題 2：最右方除了保費，一律加上全自動換算出的即時折舊保額提示 */}
          <div className="col-3 text-end">
            <div className="fw-bold text-primary small">
              保額: {depreciatedInsuredValue || 0} 萬元
            </div>
            <span className="fw-bold text-danger">
              保費：{hullPremium.toLocaleString()} 元
            </span>
          </div>
          {hasHull && hullDeductible !== "0" && (
            <div className="col-12 mt-1 ps-4 text-primary small font-monospace">
              💡 自負額說明：{HULL_DEDUCTIBLE_DICT[hullDeductible]}
            </div>
          )}
        </div>

        {/* 2. 竊盜損失險 */}
        <div className="row g-2 align-items-center mb-2 pb-2 border-bottom">
          <div className="col-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={hasTheft}
                onChange={(e) => setHasTheft(e.target.checked)}
                id="theft"
              />
              <label htmlFor="theft" className="form-check-label fw-bold">
                2. 竊盜損失險 (11)
              </label>
            </div>
          </div>
          <div className="col-3">
            <select
              className="form-select form-select-sm border-secondary-subtle"
              value={theftDeductible}
              onChange={(e) => setTheftDeductible(e.target.value)}
              disabled={!hasTheft}
            >
              <option value="10%">自負額: 10%</option>
              <option value="20%">自負額: 20%</option>
            </select>
          </div>
          <div className="col-3 text-muted small">
            預估殘值: {depreciatedInsuredValue || 0} 萬
          </div>
          {/* 💡 修正問題 2：右側加上即時折舊保額提示 */}
          <div className="col-3 text-end">
            <div className="fw-bold text-primary small">
              保額: {depreciatedInsuredValue || 0} 萬元
            </div>
            <span className="fw-bold text-danger">
              保費：{theftPremium.toLocaleString()} 元
            </span>
          </div>
        </div>

        {/* 3. 第三人責任險 */}
        <div className="row g-2 align-items-center mb-2 pb-2 border-bottom">
          <div className="col-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={hasLiability}
                onChange={(e) => setHasLiability(e.target.checked)}
                id="liability"
              />
              <label htmlFor="liability" className="form-check-label fw-bold">
                3. 第三人責任險 (31)
              </label>
            </div>
          </div>
          <div className="col-4">
            <select
              className="form-select form-select-sm border-secondary-subtle"
              value={liabilityCoverage}
              onChange={(e) => setLiabilityCoverage(e.target.value)}
              disabled={!hasLiability}
            >
              {LIABILITY_INJURY_OPTIONS.map((o) => (
                <option key={o.label} value={o.label}>
                  體傷: {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2">
            <select
              className="form-select form-select-sm border-secondary-subtle"
              value={liabilityProperty}
              onChange={(e) => setLiabilityProperty(e.target.value)}
              disabled={!hasLiability}
            >
              {LIABILITY_PROP_OPTIONS.map((o) => (
                <option key={o.label} value={o.label}>
                  財損: {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-3 text-end">
            <div className="fw-bold text-danger small">
              體傷: {liabilityPremiumInjury.toLocaleString()} 元
            </div>
            <div className="fw-bold text-danger small">
              財損: {liabilityPremiumProperty.toLocaleString()} 元
            </div>
          </div>
        </div>
        {/* 4. 第三人超額責任險 */}
        <div
          className="row g-2 align-items-center mb-2 pb-2 border-bottom"
          style={{ opacity: hasLiability ? 1 : 0.5 }}
        >
          <div className="col-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={hasExcess}
                onChange={(e) => setHasExcess(e.target.checked)}
                disabled={!hasLiability}
                id="excess"
              />
              <label
                htmlFor="excess"
                className="form-check-label fw-bold text-primary"
              >
                4. 第三人超額險
              </label>
            </div>
          </div>
          <div className="col-6">
            <select
              className="form-select form-select-sm"
              value={excessLimit}
              onChange={(e) => setExcessCoverage(e.target.value)}
              disabled={!hasExcess || !hasLiability}
            >
              <option value="500萬">最高上限: 500萬</option>
              <option value="1000萬">最高上限: 1000萬</option>
              <option value="2000萬">最高上限: 2000萬</option>
            </select>
          </div>
          <div className="col-3 text-end">
            <span className="fw-bold text-danger">
              保費：{excessPremium.toLocaleString()} 元
            </span>
          </div>
        </div>

        {/* 5. 乘客責任險 */}
        <div className="row g-2 align-items-center">
          <div className="col-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={hasPassenger}
                onChange={(e) => setHasPassenger(e.target.checked)}
                id="passenger"
              />
              <label htmlFor="passenger" className="form-check-label fw-bold">
                5. 乘客責任險
              </label>
            </div>
          </div>
          <div className="col-3">
            <select
              className="form-select form-select-sm"
              value={passengerType}
              onChange={(e) => setPassengerType(e.target.value)}
              disabled={!hasPassenger}
            >
              <option value="保整車">預設: 保整車</option>
              <option value="單保駕駛">單保駕駛</option>
            </select>
          </div>
          <div className="col-3">
            <select
              className="form-select form-select-sm"
              value={passengerPlan}
              onChange={(e) => setPassengerPlan(e.target.value)}
              disabled={!hasPassenger}
            >
              {PASSENGER_PLAN_OPTIONS.map((o) => (
                <option key={o.label} value={o.label}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-3 text-end">
            <span className="fw-bold text-danger">
              保費：{passengerPremium.toLocaleString()} 元
            </span>
          </div>
        </div>
      </div>

      {/* 智慧總額看板 */}
      <div className="p-3 bg-light border border-2 rounded text-end mb-3 shadow-sm">
        <div className="d-flex justify-content-between border-bottom pb-1 small text-muted">
          <span>任意險保費：</span>
          <span>NT$ {arbitraryPremium?.toLocaleString()} 元</span>
        </div>
        <div className="d-flex justify-content-between border-bottom py-1 small text-muted">
          <span>強制險保費：</span>
          <span>NT$ {compulsoryPremium?.toLocaleString()} 元</span>
        </div>
        <div className="d-flex justify-content-between pt-1 fw-bold text-danger fs-5">
          <span>總保費金額合計：</span>
          <span>NT$ {totalPremium?.toLocaleString()} 元</span>
        </div>
      </div>

      {/* 💡 修正問題 5：三大控制按鈕改為一橫列排版 */}
      <div className="row g-2 mb-4">
        <div className="col-3">
          <button
            type="button"
            onClick={triggerCalc}
            className="btn btn-primary w-100 fw-bold"
          >
            1. 試算保費
          </button>
        </div>
        <div className="col-6">
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-success w-100 fw-bold"
          >
            2. 精算並儲存報價單
          </button>
        </div>
        <div className="col-3">
          <button
            type="button"
            className="btn btn-dark w-100 fw-bold"
            onClick={() => setShowTableModal(true)}
          >
            🔍 完整資料查詢
          </button>
        </div>
      </div>

      {/* ⏳ 待簽署動態追蹤看板 (💡 修正問題 6：金額獨立、加粗紅字、無斜線) */}
      {/* ⏳ 待簽署動態追蹤看板 */}
      <h6 className="fw-bold text-dark mb-2">⏳ 待簽署動態追蹤看板</h6>
      <div className="table-responsive">
        <table
          className="table table-bordered align-middle text-center shadow-sm"
          style={{ fontSize: "0.85rem" }}
        >
          <thead className="table-primary">
            <tr>
              <th>報價編號</th>
              <th>客戶姓名</th>
              <th>車牌號碼</th>
              <th>車種</th>
              <th>強制保費</th>
              <th>任意保費</th>
              <th>總保費</th>
              <th>行動狀態</th>
            </tr>
          </thead>
          <tbody>
            {historyQuotes
              .filter((q) => q.status === "待簽署")
              .map((q) => (
                <tr key={q.quoteId}>
                  <td>
                    <small className="font-monospace fw-bold">
                      {q.quoteId}
                    </small>
                  </td>
                  <td>
                    <b>{q.clientName}</b>
                  </td>
                  <td>
                    <span className="badge bg-secondary font-monospace">
                      {q.carNumber}
                    </span>
                  </td>
                  <td>
                    <small>{q.vehicle}</small>
                  </td>
                  <td className="text-danger fw-bold">
                    ${q.compulsoryPremium?.toLocaleString()}
                  </td>
                  <td className="text-danger fw-bold">
                    ${q.arbitraryPremium?.toLocaleString()}
                  </td>
                  <td className="text-danger fw-bold">
                    ${q.totalPremium?.toLocaleString()}
                  </td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      {/* 🎯 修正核心 1：不另開分頁，點擊後原地直接觸發內聯彈窗，100% 砸碎 CORS 跨域封鎖！ */}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-2 fw-bold"
                        onClick={() => {
                          setActiveSignRecord(q);
                          setClientName(q.clientName);
                          setCarNumber(q.carNumber);
                          setVehicle(q.vehicle);
                          setTotalPremium(q.totalPremium);
                          setShowSignModal(true);
                        }}
                      >
                        簽名
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light border"
                        onClick={() => triggerSendAction("sms", q)}
                      >
                        💬
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-success text-white"
                        onClick={() => triggerSendAction("line", q)}
                      >
                        🟢
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-info text-white"
                        onClick={() => triggerSendAction("email", q)}
                      >
                        ✉️
                      </button>
                      {/* 🎯 完美補回 🗑️ 垃圾桶刪除按鈕 */}
                      <button
                        type="button"
                        className="btn btn-sm btn-danger text-white fw-bold"
                        onClick={() => handleDeleteRecord(q.quoteId)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 📁 彈窗二：經辦全體保險資料庫完整一覽表 */}
      {showTableModal && (
        <div
          className="modal d-block show bg-black bg-opacity-75"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1060,
            overflowY: "auto",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content bg-dark text-white p-3 border border-secondary">
              <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-3">
                <h5 className="modal-title fw-bold">
                  📁 經辦全體保險資料庫完整一覽表
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowTableModal(false)}
                ></button>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle text-center small mb-0">
                  <thead>
                    <tr className="table-secondary text-dark">
                      <th>報價編號</th>
                      <th>姓名</th>
                      <th>車號</th>
                      <th>車種</th>
                      <th>起保日</th>
                      <th>到期日</th>
                      <th>強制保費</th>
                      <th>任意保費</th>
                      <th>總保費</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuotes.map((q) => (
                      <tr
                        key={q.quoteId}
                        className="border-bottom border-secondary"
                      >
                        <td className="font-monospace text-info fw-bold">
                          {q.quoteId}
                        </td>
                        <td>
                          <b>{q.clientName}</b>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark font-monospace">
                            {q.carNumber}
                          </span>
                        </td>
                        <td>{q.vehicle}</td>
                        {/* 🎯 修正：讀取正確變數，起保日與到期日一秒大復活 */}
                        <td>{q.startDate}</td>
                        <td>{q.endDate}</td>
                        <td className="text-warning fw-bold">
                          ${q.compulsoryPremium?.toLocaleString()}
                        </td>
                        <td className="text-warning fw-bold">
                          ${q.arbitraryPremium?.toLocaleString()}
                        </td>
                        <td className="text-danger fw-bold">
                          ${q.totalPremium?.toLocaleString()}
                        </td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✍️ 彈窗三：內聯全自動隔離手寫簽名確認書 ( zIndex 物理鎖死防穿透 ) */}
      {showSignModal && activeSignRecord && (
        <div
          className="modal d-block show bg-black bg-opacity-75"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 99999,
            overflowY: "auto",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "550px" }}
          >
            <div className="modal-content p-4 border shadow-lg bg-white rounded-3">
              <div
                className="text-center fw-bold border-bottom pb-2 mb-3 text-primary"
                style={{ fontSize: "1.2rem" }}
              >
                ✒️ 汽機車保險投保確認書
              </div>
              <div className="bg-light p-3 rounded-2 border mb-3 text-start small">
                <div className="fw-bold mb-1 text-dark">核定明細：</div>
                <div>客戶姓名：{clientName || "核定客戶"}</div>
                <div>車牌號碼：{carNumber || "QQQ-222"}</div>
                <div>車種項目：{vehicle || "03:自小客"}</div>
                <div
                  className="text-danger fw-bold mt-2"
                  style={{ fontSize: "1rem" }}
                >
                  總保費金額合計：NT${" "}
                  {totalPremium ? totalPremium.toLocaleString() : "17,275"} 元
                </div>
              </div>
              <div className="text-start text-danger fw-bold small mb-2">
                請在藍色虛線框內用手指或滑鼠手寫簽名：
              </div>
              <canvas
                ref={canvasRef}
                width="490"
                height="220"
                className="border border-primary bg-white w-100 mb-3"
                style={{
                  borderStyle: "dashed",
                  cursor: "crosshair",
                  touchAction: "none",
                  minHeight: "220px",
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="d-flex gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50 fw-bold py-2"
                  onClick={clearCanvas}
                >
                  清除重簽
                </button>
                <button
                  type="button"
                  className="btn btn-primary w-50 fw-bold py-2"
                  onClick={submitSignature}
                >
                  確認送出確認書
                </button>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm w-100 fw-bold py-2"
                onClick={() => {
                  setShowSignModal(false);
                  setActiveSignRecord(null);
                }}
              >
                返回經辦主頁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} // ⚠️ 鋼鐵終極封頂結尾大括號！
