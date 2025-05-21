import {
  Conversion,
  ConversionCategory,
  ConversionType,
  Favorite,
} from "./types";
import axios from "axios";

class ConverterApp {
  private categories: ConversionCategory[] = [
    {
      type: "length",
      label: "Length",
      units: [
        { value: "m", label: "Meter" },
        { value: "km", label: "Kilometer" },
        { value: "ft", label: "Foot" },
        { value: "in", label: "Inch" },
        { value: "yd", label: "Yard" },
        { value: "mi", label: "Mile" },
      ],
    },
    {
      type: "temperature",
      label: "Temperature",
      units: [
        { value: "c", label: "Celsius" },
        { value: "f", label: "Fahrenheit" },
        { value: "k", label: "Kelvin" },
      ],
    },
    {
      type: "weight",
      label: "Weight",
      units: [
        { value: "g", label: "Gram" },
        { value: "kg", label: "Kilogram" },
        { value: "lb", label: "Pound" },
      ],
    },
    {
      type: "volume",
      label: "Volume",
      units: [
        { value: "l", label: "Liter" },
        { value: "gal", label: "Gallon" },
      ],
    },
    {
      type: "currency",
      label: "Currency",
      units: [
        { value: "EUR", label: "Euro" },
        { value: "USD", label: "US Dollar" },
        { value: "GBP", label: "British Pound" },
        { value: "JPY", label: "Japanese Yen" },
      ],
    },
    {
      type: "crypto",
      label: "Cryptocurrency",
      units: [
        { value: "BTC", label: "Bitcoin" },
        { value: "ETH", label: "Ethereum" },
        { value: "SOL", label: "Solana" },
      ],
    },
  ];

  private currentCategory: ConversionType = "length";
  private favorites: Favorite[] = [];
  private history: Conversion[] = [];

  constructor() {
    this.loadFromLocalStorage();
    this.initializeUI();
    this.setupEventListeners();
  }

  private loadFromLocalStorage(): void {
    const savedFavorites = localStorage.getItem("favorites");
    const savedHistory = localStorage.getItem("history");

    if (savedFavorites) {
      this.favorites = JSON.parse(savedFavorites);
    }
    if (savedHistory) {
      this.history = JSON.parse(savedHistory);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem("favorites", JSON.stringify(this.favorites));
    localStorage.setItem("history", JSON.stringify(this.history));
  }

  private initializeUI(): void {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = `
      <div class="min-h-screen bg-gray-100 py-8">
        <div class="container mx-auto px-4">
          <h1 class="text-3xl font-bold text-center mb-8">Unit Converter</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Converter Section -->
            <div class="converter-card">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select id="categorySelect" class="converter-select">
                  ${this.categories
                    .map(
                      (cat) =>
                        `<option value="${cat.type}">${cat.label}</option>`
                    )
                    .join("")}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <select id="fromUnit" class="converter-select"></select>
                  <input type="number" id="fromValue" class="converter-input mt-2" placeholder="Enter value">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <select id="toUnit" class="converter-select"></select>
                  <input type="number" id="toValue" class="converter-input mt-2" readonly>
                </div>
              </div>

              <div class="mt-4 flex justify-between">
                <button id="convertBtn" class="converter-button">Convert</button>
                <button id="addFavoriteBtn" class="converter-button bg-gray-600 hover:bg-gray-500">Add to Favorites</button>
              </div>
            </div>

            <!-- Favorites Section -->
            <div class="converter-card">
              <h2 class="text-xl font-semibold mb-4">Favorites</h2>
              <div id="favoritesList" class="space-y-2"></div>
            </div>
          </div>

          <!-- History Section -->
          <div class="converter-card mt-8">
            <h2 class="text-xl font-semibold mb-4">History</h2>
            <div id="historyList" class="space-y-2"></div>
          </div>
        </div>
      </div>
    `;

    this.updateUnitSelects();
    this.updateFavoritesList();
    this.updateHistoryList();
  }

  private setupEventListeners(): void {
    const categorySelect = document.getElementById(
      "categorySelect"
    ) as HTMLSelectElement;
    const fromValue = document.getElementById("fromValue") as HTMLInputElement;
    const convertBtn = document.getElementById("convertBtn");
    const addFavoriteBtn = document.getElementById("addFavoriteBtn");
    const favoritesList = document.getElementById("favoritesList");

    categorySelect?.addEventListener("change", () => {
      this.currentCategory = categorySelect.value as ConversionType;
      this.updateUnitSelects();
    });

    fromValue?.addEventListener("input", () => {
      this.performConversion();
    });

    convertBtn?.addEventListener("click", () => {
      this.performConversion();
    });

    addFavoriteBtn?.addEventListener("click", () => {
      this.addToFavorites();
    });

    // Add event delegation for remove favorite buttons
    favoritesList?.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("remove-favorite")) {
        const favoriteId = target.getAttribute("data-id");
        if (favoriteId) {
          this.removeFavorite(favoriteId);
        }
      }
    });
  }

  private updateUnitSelects(): void {
    const category = this.categories.find(
      (cat) => cat.type === this.currentCategory
    );
    if (!category) return;

    const fromUnit = document.getElementById("fromUnit") as HTMLSelectElement;
    const toUnit = document.getElementById("toUnit") as HTMLSelectElement;

    if (fromUnit && toUnit) {
      fromUnit.innerHTML = category.units
        .map((unit) => `<option value="${unit.value}">${unit.label}</option>`)
        .join("");
      toUnit.innerHTML = fromUnit.innerHTML;
    }
  }

  private async performConversion(): Promise<void> {
    const fromUnit = (document.getElementById("fromUnit") as HTMLSelectElement)
      .value;
    const toUnit = (document.getElementById("toUnit") as HTMLSelectElement)
      .value;
    const fromValue = parseFloat(
      (document.getElementById("fromValue") as HTMLInputElement).value
    );
    const toValue = document.getElementById("toValue") as HTMLInputElement;

    if (isNaN(fromValue)) {
      toValue.value = "";
      return;
    }

    let result: number;

    if (
      this.currentCategory === "currency" ||
      this.currentCategory === "crypto"
    ) {
      result = await this.convertCurrency(fromUnit, toUnit, fromValue);
    } else {
      result = this.convertUnit(fromUnit, toUnit, fromValue);
    }

    toValue.value = result.toFixed(4);

    const conversion: Conversion = {
      id: Date.now().toString(),
      type: this.currentCategory,
      from: fromUnit,
      to: toUnit,
      value: fromValue,
      result: result,
      timestamp: Date.now(),
    };

    this.history.unshift(conversion);
    if (this.history.length > 10) this.history.pop();
    this.saveToLocalStorage();
    this.updateHistoryList();
  }

  private async convertCurrency(
    from: string,
    to: string,
    value: number
  ): Promise<number> {
    try {
      const response = await axios.get(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${from.toLowerCase()}/${to.toLowerCase()}.json`
      );
      const data = response.data as { [key: string]: number };
      return value * data[to.toLowerCase()];
    } catch (error) {
      console.error("Error converting currency:", error);
      return 0;
    }
  }

  private convertUnit(from: string, to: string, value: number): number {
    const factors: { [key: string]: { [key: string]: number } } = {
      length: {
        m: 1,
        km: 1000,
        ft: 0.3048,
        in: 0.0254,
        yd: 0.9144,
        mi: 1609.344,
      },
      temperature: {
        c: 1,
        f: ((value - 32) * 5) / 9,
        k: value - 273.15,
      },
      weight: {
        g: 1,
        kg: 1000,
        lb: 453.592,
      },
      volume: {
        l: 1,
        gal: 3.78541,
      },
    };

    const category = this.currentCategory;
    if (category === "temperature") {
      if (from === "c" && to === "f") return (value * 9) / 5 + 32;
      if (from === "c" && to === "k") return value + 273.15;
      if (from === "f" && to === "c") return ((value - 32) * 5) / 9;
      if (from === "f" && to === "k") return ((value - 32) * 5) / 9 + 273.15;
      if (from === "k" && to === "c") return value - 273.15;
      if (from === "k" && to === "f") return ((value - 273.15) * 9) / 5 + 32;
      return value;
    }

    const fromFactor = factors[category]?.[from] || 1;
    const toFactor = factors[category]?.[to] || 1;
    return (value * fromFactor) / toFactor;
  }

  private addToFavorites(): void {
    const fromUnit = (document.getElementById("fromUnit") as HTMLSelectElement)
      .value;
    const toUnit = (document.getElementById("toUnit") as HTMLSelectElement)
      .value;

    const favorite: Favorite = {
      id: Date.now().toString(),
      type: this.currentCategory,
      from: fromUnit,
      to: toUnit,
    };

    this.favorites.push(favorite);
    this.saveToLocalStorage();
    this.updateFavoritesList();
  }

  private removeFavorite(id: string): void {
    this.favorites = this.favorites.filter((fav) => fav.id !== id);
    this.saveToLocalStorage();
    this.updateFavoritesList();
  }

  private updateFavoritesList(): void {
    const favoritesList = document.getElementById("favoritesList");
    if (!favoritesList) return;

    favoritesList.innerHTML = this.favorites
      .map(
        (fav) => `
      <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
        <span>${this.getUnitLabel(fav.from)} → ${this.getUnitLabel(
          fav.to
        )}</span>
        <button data-id="${
          fav.id
        }" class="remove-favorite text-gray-600 hover:text-gray-800">
          Remove
        </button>
      </div>
    `
      )
      .join("");
  }

  private updateHistoryList(): void {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    historyList.innerHTML = this.history
      .map(
        (conv) => `
      <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
        <span>
          ${conv.value} ${this.getUnitLabel(conv.from)} → ${conv.result.toFixed(
          4
        )} ${this.getUnitLabel(conv.to)}
        </span>
        <span class="text-sm text-gray-500">
          ${new Date(conv.timestamp).toLocaleString()}
        </span>
      </div>
    `
      )
      .join("");
  }

  private getUnitLabel(unit: string): string {
    const category = this.categories.find(
      (cat) => cat.type === this.currentCategory
    );
    return category?.units.find((u) => u.value === unit)?.label || unit;
  }
}

declare global {
  interface Window {
    app: ConverterApp;
  }
}

const app = new ConverterApp();
window.app = app;
