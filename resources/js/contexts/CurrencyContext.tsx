import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Currency = {
  code: string;
  symbol: string;
  rate: number;
};

type CurrencyContextValue = {
  currencies: Currency[];
  selected: Currency;
  setCurrency: (code: string) => void;
  format: (ukEuAmountGbp: number, internationalAmountGbp?: number) => string;
  convert: (ukEuAmountGbp: number, internationalAmountGbp?: number) => number;
};

const defaultCurrency: Currency = {
  code: "GBP",
  symbol: "£",
  rate: 1,
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const CurrencyProvider = ({ children }: Props) => {
  const [currencies, setCurrencies] = useState<Currency[]>([defaultCurrency]);
  const [selected, setSelected] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const storedCode = window.localStorage.getItem("sarafina_currency_code");

    const load = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/GBP");
        if (!response.ok) return;

        const data = await response.json();
        const rates = data?.rates || {};

        const supported: { code: string; symbol: string }[] = [
          { code: "GBP", symbol: "£" },
          { code: "USD", symbol: "$" },
          { code: "EUR", symbol: "€" },
          { code: "ZAR", symbol: "R" },
          { code: "NGN", symbol: "₦" },
          { code: "AUD", symbol: "$" },
          { code: "CAD", symbol: "$" },
        ];

        const list: Currency[] = supported.map((c) => ({
          code: c.code,
          symbol: c.symbol,
          rate: c.code === "GBP" ? 1 : Number(rates[c.code] ?? 1),
        }));

        setCurrencies(list);

        if (storedCode) {
          const match = list.find((c) => c.code === storedCode.toUpperCase());
          if (match) {
            setSelected(match);
            return;
          }
        }

        const base = list.find((c) => c.code === "GBP");
        if (base) {
          setSelected(base);
        } else if (list.length) {
          setSelected(list[0]);
        }
      } catch {
      }
    };

    load();
  }, []);

  const setCurrency = (code: string) => {
    const match = currencies.find((c) => c.code === code.toUpperCase());
    if (!match) {
      return;
    }
    setSelected(match);
    window.localStorage.setItem("sarafina_currency_code", match.code);
  };

  const convert = (ukEuAmountGbp: number, internationalAmountGbp?: number) => {
    const ukValue = Number(ukEuAmountGbp || 0);
    const intlValue = typeof internationalAmountGbp === "number" ? Number(internationalAmountGbp) : ukValue;

    const baseAmount = selected.code === "GBP" ? ukValue : intlValue;

    if (!baseAmount || Number.isNaN(baseAmount)) {
      return 0;
    }

    if (selected.code === "GBP") {
      return baseAmount;
    }

    return baseAmount * selected.rate;
  };

  const format = (ukEuAmountGbp: number, internationalAmountGbp?: number) => {
    const value = convert(ukEuAmountGbp, internationalAmountGbp);
    return `${selected.symbol}${value.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        selected,
        setCurrency,
        format,
        convert,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
};
