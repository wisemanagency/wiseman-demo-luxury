import { useMemo, useState } from "react";

interface Property {
  _id: string;
  slug: string;
  title: string;
  status: string;
  propertyType?: string;
  price: number;
  priceQualifier?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  town?: string;
  postcode?: string;
  thumbnail?: {
    asset: { url: string; metadata?: { lqip?: string } };
    alt?: string;
  };
}

interface Props {
  properties: Property[];
  towns: string[];
  propertyTypes: string[];
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "for-sale", label: "For Sale" },
  { value: "for-rent", label: "To Let" },
  { value: "under-offer", label: "Under Offer" },
  { value: "sold-stc", label: "Sold STC" },
];

const bedroomOptions = [
  { value: "", label: "Any Beds" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

const priceRanges = [
  { value: "", label: "Any Price" },
  { value: "0-250000", label: "Up to £250k" },
  { value: "250000-500000", label: "£250k – £500k" },
  { value: "500000-750000", label: "£500k – £750k" },
  { value: "750000-1000000", label: "£750k – £1m" },
  { value: "1000000-999999999", label: "£1m+" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price (Low–High)" },
  { value: "price-desc", label: "Price (High–Low)" },
  { value: "beds-desc", label: "Most Bedrooms" },
];

function formatPrice(price: number, qualifier?: string): string {
  if (!price && qualifier === "POA") return "POA";
  const formatted = `£${price.toLocaleString("en-GB")}`;
  return qualifier && qualifier !== "POA" ? `${qualifier} ${formatted}` : formatted;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    "for-sale": "For Sale",
    "under-offer": "Under Offer",
    "sold-stc": "Sold STC",
    sold: "Sold",
    "for-rent": "To Let",
    "let-agreed": "Let Agreed",
    let: "Let",
  };
  return map[status] || status;
}

/* Luxury palette mapped to inline styles so the JSX stays simple and the
   colours stay centralised. Mirrors the CSS tokens in global.css. */
const palette = {
  bg: "#ffffff",
  bgSoft: "#dceaea",
  textPrimary: "#1b2733",
  textSecondary: "#5b6670",
  textMuted: "#84909c",
  border: "#e6eaee",
  teal: "#2c6569",
  tealDark: "#1f4e51",
  gold: "#c9a227",
  goldDark: "#a88419",
  radius: "10px",
  radiusPill: "999px",
};

export default function PropertyFilter({ properties, towns, propertyTypes }: Props) {
  const [status, setStatus] = useState("");
  const [town, setTown] = useState("");
  const [type, setType] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...properties];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.town?.toLowerCase().includes(q) ||
          p.postcode?.toLowerCase().includes(q),
      );
    }
    if (status) result = result.filter((p) => p.status === status);
    if (town) result = result.filter((p) => p.town === town);
    if (type) result = result.filter((p) => p.propertyType === type);
    if (minBeds) result = result.filter((p) => (p.bedrooms ?? 0) >= parseInt(minBeds, 10));
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "beds-desc":
        result.sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0));
        break;
      default:
        break;
    }
    return result;
  }, [properties, status, town, type, minBeds, priceRange, sort, search]);

  /* ----- Shared styling primitives ----- */
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: palette.teal,
    marginBottom: 8,
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "#fff",
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    fontSize: 14,
    color: palette.textPrimary,
    fontFamily: "Poppins, system-ui, sans-serif",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1l4 4 4-4' stroke='%23718096' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    cursor: "pointer",
  };

  const clearAll = () => {
    setStatus("");
    setTown("");
    setType("");
    setMinBeds("");
    setPriceRange("");
    setSearch("");
  };

  /* ----- Sidebar (filter controls) ----- */
  const sidebar = (
    <aside
      className="pf-sidebar"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: palette.radius,
        padding: 24,
        boxShadow: "0 6px 18px rgba(15, 26, 33, 0.04)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: palette.gold,
            marginBottom: 6,
          }}
        >
          Refine
        </span>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 600,
            color: palette.textPrimary,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Your search
        </h3>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle} htmlFor="pf-search">
          Keyword
        </label>
        <div style={{ position: "relative" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={palette.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="pf-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Location, postcode, or keyword…"
            style={{
              ...fieldStyle,
              backgroundImage: "none",
              paddingLeft: 36,
              cursor: "text",
              textAlign: "left",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle} htmlFor="pf-status">
          Status
        </label>
        <select id="pf-status" value={status} onChange={(e) => setStatus(e.target.value)} style={fieldStyle}>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle} htmlFor="pf-town">
          Area
        </label>
        <select id="pf-town" value={town} onChange={(e) => setTown(e.target.value)} style={fieldStyle}>
          <option value="">All Areas</option>
          {towns.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle} htmlFor="pf-type">
          Property Type
        </label>
        <select id="pf-type" value={type} onChange={(e) => setType(e.target.value)} style={fieldStyle}>
          <option value="">All Types</option>
          {propertyTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle} htmlFor="pf-beds">
          Bedrooms
        </label>
        <select id="pf-beds" value={minBeds} onChange={(e) => setMinBeds(e.target.value)} style={fieldStyle}>
          {bedroomOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle} htmlFor="pf-price">
          Price Range
        </label>
        <select id="pf-price" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} style={fieldStyle}>
          {priceRanges.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={clearAll}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "transparent",
          color: palette.teal,
          border: `1px solid ${palette.border}`,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "background-color 0.15s ease, border-color 0.15s ease",
        }}
      >
        Clear Filters
      </button>
    </aside>
  );

  /* ----- Results header + grid ----- */
  const resultsHeader = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <p style={{ fontSize: 14, color: palette.textSecondary, margin: 0 }}>
        <strong style={{ color: palette.textPrimary, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, fontSize: 18 }}>
          {filtered.length}
        </strong>{" "}
        {filtered.length === 1 ? "property" : "properties"} found
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label
          htmlFor="pf-sort"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: palette.textMuted }}
        >
          Sort
        </label>
        <select
          id="pf-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            ...fieldStyle,
            width: 200,
            padding: "8px 12px",
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const resultsGrid = (
    <div className="pf-grid">
      {filtered.map((property) => (
        <a
          key={property._id}
          href={`/properties/${property.slug}`}
          className="pf-card"
          style={{
            display: "block",
            background: palette.bg,
            border: `1px solid ${palette.border}`,
            borderRadius: palette.radius,
            overflow: "hidden",
            textDecoration: "none",
            color: "inherit",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
        >
          <div className="pf-card-image" style={{ position: "relative", aspectRatio: "3 / 2", overflow: "hidden", background: palette.bgSoft }}>
            <img
              src={
                property.thumbnail?.asset?.url
                  ? `${property.thumbnail.asset.url}?w=600&h=400&fit=crop&auto=format`
                  : "/floorplan-placeholder.svg"
              }
              alt={property.thumbnail?.alt || property.title}
              loading="lazy"
              className="w-full h-full object-cover"
              style={{ display: "block" }}
            />
            <span
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                padding: "4px 10px",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                lineHeight: 1.2,
                borderRadius: palette.radiusPill,
                boxShadow: "0 4px 10px rgba(11, 19, 26, 0.18)",
                color: "#fff",
                background:
                  property.status === "for-sale" || property.status === "under-offer" || property.status === "sold-stc"
                    ? palette.teal
                    : property.status === "for-rent" || property.status === "let-agreed" || property.status === "let"
                      ? palette.bgSoft
                      : "rgba(255,255,255,0.92)",
                color: property.status === "for-rent" ? palette.teal : property.status === "for-sale" || property.status === "under-offer" || property.status === "sold-stc" ? "#fff" : palette.textPrimary,
              }}
            >
              {statusLabel(property.status)}
            </span>
          </div>
          <div style={{ padding: 16 }}>
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontWeight: 600,
                color: palette.teal,
                margin: "0 0 4px",
                lineHeight: 1.3,
              }}
            >
              {formatPrice(property.price, property.priceQualifier)}
            </p>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: palette.textPrimary,
                margin: "0 0 6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {property.title}
            </h3>
            <p style={{ fontSize: 12, color: palette.textMuted, margin: "0 0 12px" }}>
              {[property.town, property.postcode].filter(Boolean).join(", ")}
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                fontSize: 12,
                color: palette.textMuted,
                paddingTop: 10,
                borderTop: `1px solid ${palette.border}`,
              }}
            >
              {property.bedrooms != null && <span>{property.bedrooms} bed</span>}
              {property.bathrooms != null && <span>{property.bathrooms} bath</span>}
              {property.sqft != null && <span>{property.sqft.toLocaleString("en-GB")} sq ft</span>}
            </div>
          </div>
        </a>
      ))}
    </div>
  );

  const emptyState = (
    <div
      style={{
        textAlign: "center",
        padding: "64px 16px",
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: palette.radius,
      }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22,
          fontWeight: 600,
          color: palette.textPrimary,
          margin: "0 0 8px",
        }}
      >
        No properties match
      </p>
      <p style={{ color: palette.textMuted, margin: "0 0 24px" }}>
        Try widening your filters or clearing all of them.
      </p>
      <button
        type="button"
        onClick={clearAll}
        style={{
          padding: "12px 28px",
          background: palette.teal,
          color: "#fff",
          border: 0,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div
      className="pf-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 28,
        alignItems: "start",
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .pf-layout {
            grid-template-columns: 280px 1fr !important;
          }
          .pf-sidebar {
            position: sticky;
            top: 88px;
          }
        }
        .pf-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(15, 26, 33, 0.08);
        }
        .pf-card-image img {
          transition: transform 0.35s ease;
        }
        .pf-card:hover .pf-card-image img {
          transform: scale(1.04);
        }
        .pf-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 20px;
        }
        @media (min-width: 640px) {
          .pf-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1280px) {
          .pf-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .pf-sidebar button:hover {
          background: ${palette.bgSoft} !important;
          border-color: ${palette.teal} !important;
        }
        .pf-sidebar select:focus,
        .pf-sidebar input:focus {
          outline: none;
          border-color: ${palette.teal};
          box-shadow: 0 0 0 3px rgba(44, 101, 105, 0.15);
        }
      `}</style>

      {sidebar}

      <div>
        {resultsHeader}
        {filtered.length > 0 ? resultsGrid : emptyState}
      </div>
    </div>
  );
}
