
"use client"

import {
  LayoutDashboard,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ShieldCheck,
  Layers3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Landmark,
  CircleGauge,
  Globe2,
  MoreHorizontal,
  Download,
  Plus,
  Clock3,
  Zap,
  Trash2,
} from 'lucide-react'

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { useState, useEffect, type FormEvent } from 'react'
import PortfolioAllocationWidget from './widgets/PortfolioAllocationWidget'
import PerformanceLineWidget from './widgets/PerformanceLineWidget'
import SectorHeatMapWidget from "./widgets/SectorHeatMapWidget";
import HoldingsDataTableWidget from "./widgets/HoldingsDataTableWidget";
import NewsResearchFeedWidget from "./widgets/NewsResearchFeedWidget";
import AlertsNotificationsWidget from "./widgets/AlertsNotificationsWidget";
import ValueAtRiskGaugeWidget from "./widgets/ValueAtRiskGaugeWidget";
import CorrelationMatrixWidget from "./widgets/CorrelationMatrixWidget";
import PerformanceAttributionWidget from "./widgets/PerformanceAttributionWidget";
import MarketOverviewTickerWidget from "./widgets/MarketOverviewTickerWidget";
import DrawdownChartWidget from "./widgets/DrawdownChartWidget";
import ExposureTreemapWidget from "./widgets/ExposureTreemapWidget";
import AnalyticsWidgetGrid from "./components/AnalyticsWidgetGrid";
import { useMockSocket } from "./hooks/useMockSocket";

type AssetClass = 'Equities' | 'Fixed Income' | 'Alternatives' | 'Cash'

type Position = {
  name: string
  symbol: string
  quantity: number
  price: number
  currentPrice: number
  assetClass: AssetClass
}

const assetClasses: AssetClass[] = [
  'Equities',
  'Fixed Income',
  'Alternatives',
  'Cash',
]

// FIXED DEMO DATA FOR COMMAND CENTER
const demoPortfolio = {
  totalAssets: 124563800,
  investedCapital: 106320000,
  unrealizedGains: 18243800,
  ytdReturn: 12.85,
  dailyPerformance: 284500,
  dailyPerformancePercent: 2.34,
  portfolioYield: 6.82,
  liquidityReserve: 14950000,
  riskLevel: 'Moderate',
}

const performanceData = [
  { month: 'Jan', value: 92 },
  { month: 'Feb', value: 105 },
  { month: 'Mar', value: 98 },
  { month: 'Apr', value: 118 },
  { month: 'May', value: 112 },
  { month: 'Jun', value: 135 },
  { month: 'Jul', value: 129 },
  { month: 'Aug', value: 151 },
  { month: 'Sep', value: 143 },
  { month: 'Oct', value: 166 },
  { month: 'Nov', value: 179 },
  { month: 'Dec', value: 195 },
]

// FIXED DEMO ALLOCATION
const allocations = [
  { name: 'Equities', value: 42, color: '#58D6C5' },
  { name: 'Fixed Income', value: 28, color: '#7798E8' },
  { name: 'Alternatives', value: 18, color: '#D5A96C' },
  { name: 'Cash', value: 12, color: '#A4A9B8' },
]

const exposures = [
  { name: 'Technology', value: 76, amount: '$32.4M' },
  { name: 'Healthcare', value: 58, amount: '$24.8M' },
  { name: 'Financials', value: 46, amount: '$19.6M' },
  { name: 'Energy', value: 31, amount: '$13.2M' },
]

const activities = [
  {
    title: 'Portfolio rebalanced',
    detail: 'Equity allocation adjusted',
    time: '10:42 AM',
    type: 'adjust',
  },
  {
    title: 'Dividend received',
    detail: 'Fixed income distribution',
    time: '09:18 AM',
    type: 'income',
  },
  {
    title: 'Risk assessment completed',
    detail: 'Portfolio risk within limits',
    time: 'Yesterday',
    type: 'risk',
  },
]

const allocationColors: Record<AssetClass, string> = {
  Equities: '#58D6C5',
  'Fixed Income': '#7798E8',
  Alternatives: '#D5A96C',
  Cash: '#A4A9B8',
}

const formatCurrency = (value: number) =>
  '$' +
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatCompactCurrency = (value: number) =>
  '$' +
  value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })

const analyticsWidgets = [
  { id: 'widget-w01', code: 'W01', title: 'Portfolio Allocation', description: 'Interactive allocation by asset class, sector, geography or custom grouping.' },
  { id: 'widget-w02', code: 'W02', title: 'Performance Line Chart', description: 'Portfolio performance compared with market benchmarks.' },
  { id: 'widget-w03', code: 'W03', title: 'Sector Heat Map', description: 'Sector-level performance and concentration overview.' },
  { id: 'widget-w04', code: 'W04', title: 'Holdings Data Table', description: 'Detailed holdings, weights, market values and returns.' },
  { id: 'widget-w05', code: 'W05', title: 'News & Research Feed', description: 'Relevant market news and investment research.' },
  { id: 'widget-w06', code: 'W06', title: 'Alerts & Notifications', description: 'Portfolio, market and risk alerts.' },
  { id: 'widget-w07', code: 'W07', title: 'Value-at-Risk Gauge', description: 'Portfolio value-at-risk indicator.' },
  { id: 'widget-w08', code: 'W08', title: 'Correlation Matrix', description: 'Correlation across portfolio assets.' },
  { id: 'widget-w09', code: 'W09', title: 'Performance Attribution', description: 'Contribution to portfolio performance by holding or sector.' },
  { id: 'widget-w10', code: 'W10', title: 'Market Overview Ticker', description: 'Market index and instrument overview.' },
  { id: 'widget-w11', code: 'W11', title: 'Drawdown Chart', description: 'Portfolio drawdown over the selected period.' },
  { id: 'widget-w12', code: 'W12', title: 'Exposure Treemap', description: 'Portfolio exposure visualized by nested categories.' },
]

function App() {
  useMockSocket();
  const [showModal, setShowModal] = useState(false)

const [positions, setPositions] = useState<Position[]>([])
const [positionsLoaded, setPositionsLoaded] = useState(false)

// LOAD PERSONAL INVESTMENTS
useEffect(() => {
  try {
    const saved = window.localStorage.getItem('meridian_positions')

    if (saved) {
      const parsed: unknown = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        const validPositions: Position[] = parsed.map((item: any) => ({
          name: String(item.name ?? ''),
          symbol: String(item.symbol ?? ''),
          quantity: Number(item.quantity ?? 0),
          price: Number(item.price ?? 0),
          currentPrice: Number(item.currentPrice ?? item.price ?? 0),
          assetClass: assetClasses.includes(item.assetClass)
            ? item.assetClass
            : 'Equities',
        }))

        setPositions(validPositions)
      }
    }
  } catch (error) {
    console.error('Unable to load saved positions:', error)
  } finally {
    setPositionsLoaded(true)
  }
}, [])

// SAVE PERSONAL INVESTMENTS
useEffect(() => {
  if (!positionsLoaded) return

  try {
    window.localStorage.setItem(
      'meridian_positions',
      JSON.stringify(positions)
    )
  } catch (error) {
    console.error('Unable to save positions:', error)
  }
}, [positions, positionsLoaded])

  const [form, setForm] = useState({
    name: '',
    symbol: '',
    quantity: '',
    price: '',
    currentPrice: '',
    assetClass: 'Equities' as AssetClass,
  })

  // PERSONAL INVESTMENT CALCULATIONS
  const personalInvested = positions.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  )

  const personalCurrentValue = positions.reduce(
    (total, item) => total + item.quantity * item.currentPrice,
    0
  )

  const personalGain = personalCurrentValue - personalInvested

  const personalReturn =
    personalInvested > 0
      ? (personalGain / personalInvested) * 100
      : 0

  const addPosition = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const quantity = Number(form.quantity)
    const price = Number(form.price)
    const currentPrice = Number(form.currentPrice)

    if (
      !form.name.trim() ||
      !form.symbol.trim() ||
      quantity <= 0 ||
      price <= 0 ||
      currentPrice <= 0
    ) {
      return
    }

    const newPosition: Position = {
      name: form.name.trim(),
      symbol: form.symbol.trim().toUpperCase(),
      quantity,
      price,
      currentPrice,
      assetClass: form.assetClass,
    }

    setPositions((prev) => [...prev, newPosition])

    setForm({
      name: '',
      symbol: '',
      quantity: '',
      price: '',
      currentPrice: '',
      assetClass: 'Equities',
    })

    setShowModal(false)
  }

  const removePosition = (index: number) => {
    const item = positions[index]

    if (!item) return

    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${item.name}?`
    )

    if (confirmDelete) {
      setPositions((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // PERSONAL ASSET ALLOCATION (separate from the fixed demo allocation)
  const personalAllocation = assetClasses
    .map((assetClass) => {
      const value = positions
        .filter((item) => item.assetClass === assetClass)
        .reduce(
          (total, item) => total + item.quantity * item.currentPrice,
          0
        )

      return {
        name: assetClass,
        value,
        color: allocationColors[assetClass],
        percentage:
          personalCurrentValue > 0
            ? (value / personalCurrentValue) * 100
            : 0,
      }
    })
    .filter((item) => item.value > 0)

  return (
    <div className="meridian">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">
            <Layers3 size={23} />
          </div>

          <div>
            <h2>MERIDIAN</h2>
            <span>CAPITAL INTELLIGENCE</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <div className="workspace">
          <div className="workspace-icon">P</div>

          <div>
            <strong>Private Wealth</strong>
            <span>Personal portfolio</span>
          </div>

          <ChevronDown size={16} />
        </div>

        <div className="nav-label">OVERVIEW</div>

        <nav>
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={19} /> Command Center
          </a>

          <a className="nav-item" href="#capital">
            <Landmark size={19} /> Capital Overview
          </a>

          <details className="nav-folder" open>
            <summary className="nav-item folder-trigger">
              <Layers3 size={19} />
              <span>Analytics Widgets</span>
              <ChevronDown size={15} className="folder-chevron" />
            </summary>
            <div className="nav-submenu">
              {analyticsWidgets.map((widget) => (
                <a key={widget.id} href={`#${widget.id}`}>
                  {widget.code} · {widget.title}
                </a>
              ))}
            </div>
          </details>

          <a className="nav-item" href="#holdings">
            <BriefcaseBusiness size={19} /> My Investments
          </a>

          <a className="nav-item" href="#risk">
            <ShieldCheck size={19} /> Risk Intelligence
          </a>

          <a className="nav-item" href="#activity">
            <Activity size={19} /> Activity Log
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-label">SYSTEM</div>

          <a className="nav-item" href="#settings">
            <Settings size={19} /> Preferences
          </a>

          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>All systems operational</strong>
              <span>Local portfolio data</span>
            </div>
          </div>

          <div className="user-profile">
            <div className="user-avatar">PJ</div>

            <div>
              <strong>Portfolio Owner</strong>
              <span>Private Wealth</span>
            </div>

            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="main-content" id="overview">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <span>MERIDIAN</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Command Center</strong>
          </div>

          <div className="topbar-right">
            <div className="market-indicator">
              <span className="status-dot"></span>
              Portfolio active
            </div>

            <button className="top-icon">
              <Search size={19} />
            </button>

            <button className="top-icon notification">
              <Bell size={19} />
              <i></i>
            </button>

            <div className="top-user">
              PJ <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <div className="content">

          {/* PAGE HEADING */}
          <section className="page-heading">
            <div>
              <div className="section-eyebrow">
                INVESTMENT INTELLIGENCE / PORTFOLIO OVERVIEW
              </div>

              <h1>Capital Command Center</h1>

              <p>
                A consolidated view of your wealth, performance and portfolio risk.
              </p>
            </div>

            <div className="heading-actions">
              <button
                className="outline-button"
                onClick={() => window.print()}
              >
                <Download size={16} /> Export Report
              </button>

              <button
                className="accent-button"
                onClick={() => setShowModal(true)}
              >
                <Plus size={17} /> New Position
              </button>
            </div>
          </section>

          {/* CAPITAL OVERVIEW - FIXED DEMO VALUES */}
          <section className="capital-hero" id="capital">

            <div className="capital-main">

              <div className="hero-label">
                <span className="hero-dot"></span>
                CONSOLIDATED NET ASSETS
              </div>

              <h2>
                {formatCompactCurrency(demoPortfolio.totalAssets)}
              </h2>

              <div className="capital-change">
                <span>
                  <ArrowUpRight size={17} />
                  {formatCompactCurrency(demoPortfolio.dailyPerformance)}
                </span>

                <span>
                  +{demoPortfolio.ytdReturn}% YTD
                </span>
              </div>

              <div className="hero-divider"></div>

              <div className="hero-meta">
                <div>
                  <span>INVESTED CAPITAL</span>
                  <strong>
                    $106.32M
                  </strong>
                </div>

                <div>
                  <span>UNREALIZED GAINS</span>
                  <strong className="mint-text">
                    +$18.24M
                  </strong>
                </div>

                <div>
                  <span>BASE CURRENCY</span>
                  <strong>USD / $</strong>
                </div>
              </div>
            </div>

            {/* WEALTH CHART */}
            <div className="hero-chart-area">

              <div className="chart-heading">
                <span>WEALTH TRAJECTORY</span>
                <span className="live-tag">● SAMPLE DATA</span>
              </div>

              <div className="hero-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient
                        id="wealthGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#58D6C5"
                          stopOpacity={0.35}
                        />

                        <stop
                          offset="100%"
                          stopColor="#58D6C5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#84969E', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background: '#142D35',
                        border: '1px solid #31505A',
                        borderRadius: 8,
                      }}
                      labelStyle={{ color: '#fff' }}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#58D6C5"
                      strokeWidth={2.5}
                      fill="url(#wealthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-periods">
                <span>JAN</span>
                <span>MAR</span>
                <span>JUN</span>
                <span>SEP</span>
                <span>DEC</span>
              </div>
            </div>
          </section>

          {/* INTELLIGENCE METRICS - FIXED DEMO VALUES */}
          <section className="metrics-grid">

            <div className="metric-card">
              <div className="metric-heading">
                <span>DAILY PERFORMANCE</span>
                <Activity size={18} />
              </div>

              <h3 className="mint-text">
                +$284,500
              </h3>

              <div className="metric-footer">
                <span className="trend-positive">
                  <ArrowUpRight size={14} /> 2.34%
                </span>
                <span>vs previous close</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-heading">
                <span>PORTFOLIO YIELD</span>
                <CircleGauge size={18} />
              </div>

              <h3>6.82%</h3>

              <div className="metric-footer">
                <span className="trend-positive">+0.42%</span>
                <span>annualized</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-heading">
                <span>LIQUIDITY RESERVE</span>
                <BriefcaseBusiness size={18} />
              </div>

              <h3>$14.95M</h3>

              <div className="metric-footer">
                <span className="neutral-text">12% of assets</span>
                <span>available capital</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-heading">
                <span>RISK EXPOSURE</span>
                <ShieldCheck size={18} />
              </div>

              <h3>Moderate</h3>

              <div className="metric-footer">
                <span className="trend-positive">Within limits</span>
                <span>risk assessment</span>
              </div>
            </div>
          </section>

          {/* ANALYSIS SECTION */}
          <section className="analysis-grid">

            {/* FIXED DEMO ASSET ALLOCATION */}
            <div
              className="content-panel allocation-panel"
              id="allocation"
            >
              <div className="panel-heading">
                <div>
                  <span className="panel-eyebrow">
                    PORTFOLIO STRUCTURE
                  </span>

                  <h3>Capital Allocation</h3>

                  <p>Distribution across asset classes</p>
                </div>

                <button className="panel-more">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="allocation-body">

                <div className="donut-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocations}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={67}
                        outerRadius={91}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {allocations.map((item) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => [
                          `${value}%`,
                          'Allocation',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="donut-label">
                    <strong>100%</strong>
                    <span>ALLOCATED</span>
                  </div>
                </div>

                <div className="allocation-details">
                  {allocations.map((item) => (
                    <div
                      className="allocation-item"
                      key={item.name}
                    >
                      <span className="allocation-name">
                        <i style={{ background: item.color }}></i>
                        {item.name}
                      </span>

                      <strong>{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MARKET EXPOSURE */}
            <div
              className="content-panel exposure-panel"
              id="exposure"
            >
              <div className="panel-heading">
                <div>
                  <span className="panel-eyebrow">
                    DIVERSIFICATION
                  </span>

                  <h3>Sector Exposure</h3>

                  <p>Capital concentration by sector</p>
                </div>

                <button className="panel-more">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="exposure-list">
                {exposures.map((item) => (
                  <div
                    className="exposure-item"
                    key={item.name}
                  >
                    <div className="exposure-top">
                      <strong>{item.name}</strong>
                      <span>{item.amount}</span>
                    </div>

                    <div className="exposure-track">
                      <div
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="exposure-footer">
                <Globe2 size={16} />
                <span>4 major sectors represented</span>
              </div>
            </div>
          </section>

          {/* ANALYTICS WIDGET WORKSPACE - W01 TO W12 */}
          <section className="analytics-workspace" id="analytics-widgets">
            <div className="analytics-workspace-heading">
              <div>
                <span className="panel-eyebrow">PORTFOLIO ANALYTICS</span>
                <h2>Analytics Widgets</h2>
                <p>All twelve configurable portfolio analytics widgets in one workspace.</p>
              </div>
              <span className="analytics-count">12 WIDGETS</span>
            </div>

            
<AnalyticsWidgetGrid
  widgetIds={analyticsWidgets.map((widget) => widget.id)}
>
  {analyticsWidgets.map((widget) => (
    <article
      className="analytics-widget-card"
      id={widget.id}
      key={widget.id}
    >
      <div className="analytics-widget-card-heading">
        <span className="widget-code">{widget.code}</span>
        <span className="widget-status">
          {[
            "W01", "W02", "W03", "W04", "W05",
            "W06", "W07", "W08", "W09", "W10", "W11"
          ].includes(widget.code)
            ? "Interactive"
            : "Widget slot"}
        </span>
      </div>

      <h3>{widget.title}</h3>
      <p className="analytics-widget-description">
        {widget.description}
      </p>

      <div className="analytics-widget-content">
        {widget.code === "W01" ? (
          <PortfolioAllocationWidget settings={{}} />
        ) : widget.code === "W02" ? (
          <PerformanceLineWidget settings={{}} />
        ) : widget.code === "W03" ? (
          <SectorHeatMapWidget settings={{}} />
        ) : widget.code === "W04" ? (
          <HoldingsDataTableWidget settings={{}} />
        ) : widget.code === "W05" ? (
          <NewsResearchFeedWidget settings={{}} />
        ) : widget.code === "W06" ? (
          <AlertsNotificationsWidget settings={{}} />
        ) : widget.code === "W07" ? (
          <ValueAtRiskGaugeWidget settings={{}} />
        ) : widget.code === "W08" ? (
          <CorrelationMatrixWidget settings={{}} />
        ) : widget.code === "W09" ? (
          <PerformanceAttributionWidget settings={{}} />
        ) : widget.code === "W10" ? (
          <MarketOverviewTickerWidget settings={{}} />
        ) : widget.code === "W11" ? (
          <DrawdownChartWidget settings={{}} />
        ) : widget.code === "W12" ? (
          <ExposureTreemapWidget settings={{}} />
        )  : (
          <div className="widget-placeholder">
            <Layers3 size={25} />
            <strong>{widget.code} component area</strong>
            <span>
              Widget framework slot reserved for this specification.
            </span>
          </div>
        )}
      </div>
    </article>
  ))}
</AnalyticsWidgetGrid>

          </section>

          {/* MY INVESTMENTS - PERSONAL DATA ONLY */}
          <section
            className="content-panel holdings-panel"
            id="holdings"
          >
            <div className="panel-heading">
              <div>
                <span className="panel-eyebrow">
                  PORTFOLIO HOLDINGS
                </span>

                <h3>My Investments</h3>

                <p>Your investment positions and returns</p>
              </div>

              <div className="positions-count">
                {positions.length} Positions
              </div>
            </div>

            {/* PERSONAL PORTFOLIO SUMMARY - DOES NOT CHANGE DEMO DATA */}
            <section className="metrics-grid">
              <div className="metric-card">
                <div className="metric-heading">
                  <span>PERSONAL INVESTED</span>
                  <Landmark size={18} />
                </div>
                <h3>{formatCurrency(personalInvested)}</h3>
                <div className="metric-footer">
                  <span>{positions.length} positions</span>
                  <span>purchase value</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-heading">
                  <span>PERSONAL CURRENT VALUE</span>
                  <ChartNoAxesCombined size={18} />
                </div>
                <h3>{formatCurrency(personalCurrentValue)}</h3>
                <div className="metric-footer">
                  <span>Portfolio valuation</span>
                  <span>entered market prices</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-heading">
                  <span>PERSONAL RETURN</span>
                  <CircleGauge size={18} />
                </div>
                <h3 className={personalGain >= 0 ? 'mint-text' : 'negative-text'}>
                  {personalReturn >= 0 ? '+' : ''}
                  {personalReturn.toFixed(2)}%
                </h3>
                <div className="metric-footer">
                  <span className={personalGain >= 0 ? 'trend-positive' : 'negative-text'}>
                    {personalGain >= 0 ? 'Profit' : 'Loss'}
                  </span>
                  <span>unrealized return</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-heading">
                  <span>POSITIONS HELD</span>
                  <BriefcaseBusiness size={18} />
                </div>
                <h3>{positions.length}</h3>
                <div className="metric-footer">
                  <span>Active holdings</span>
                  <span>your portfolio</span>
                </div>
              </div>
            </section>

            <div className="content-panel allocation-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-eyebrow">PERSONAL PORTFOLIO STRUCTURE</span>
                  <h3>My Asset Allocation</h3>
                  <p>Based on the current market value of your positions</p>
                </div>
              </div>

              {personalAllocation.length === 0 ? (
                <p className="empty-holdings">
                  Add an investment to see your personal asset allocation.
                </p>
              ) : (
                <div className="allocation-body">
                  <div className="donut-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={personalAllocation}
                          dataKey="percentage"
                          nameKey="name"
                          innerRadius={67}
                          outerRadius={91}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {personalAllocation.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${Number(value).toFixed(1)}%`,
                            'Allocation',
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-label">
                      <strong>100%</strong>
                      <span>ALLOCATED</span>
                    </div>
                  </div>

                  <div className="allocation-details">
                    {personalAllocation.map((item) => (
                      <div className="allocation-item" key={item.name}>
                        <span className="allocation-name">
                          <i style={{ background: item.color }}></i>
                          {item.name}
                        </span>
                        <strong>{item.percentage.toFixed(1)}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="holdings-table-wrapper">
              <table className="holdings-table">

                <thead>
                  <tr>
                    <th>ASSET NAME</th>
                    <th>SYMBOL</th>
                    <th>ASSET CLASS</th>
                    <th>QUANTITY</th>
                    <th>BUY PRICE</th>
                    <th>CURRENT PRICE</th>
                    <th>CURRENT VALUE</th>
                    <th>GAIN / LOSS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="empty-holdings"
                      >
                        No investments added yet. Click New Position to get started.
                      </td>
                    </tr>
                  ) : (
                    positions.map((item, index) => {
                      const invested =
                        item.quantity * item.price

                      const current =
                        item.quantity * item.currentPrice

                      const gain = current - invested

                      return (
                        <tr key={`${item.symbol}-${index}`}>

                          <td className="holding-name">
                            {item.name}
                          </td>

                          <td>
                            <span className="symbol-badge">
                              {item.symbol}
                            </span>
                          </td>

                          <td>{item.assetClass}</td>

                          <td>
                            {item.quantity.toLocaleString()}
                          </td>

                          <td>
                            {formatCurrency(item.price)}
                          </td>

                          <td>
                            {formatCurrency(item.currentPrice)}
                          </td>

                          <td className="holding-total">
                            {formatCurrency(current)}
                          </td>

                          <td
                            className={
                              gain >= 0
                                ? 'mint-text'
                                : 'negative-text'
                            }
                          >
                            {gain >= 0 ? '+' : ''}
                            {formatCurrency(gain)}
                          </td>

                          <td>
                            <button
                              className="delete-position"
                              onClick={() => removePosition(index)}
                            >
                              <Trash2 size={15} />
                              Remove
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* RISK AND ACTIVITY */}
          <section className="bottom-grid">

            {/* RISK INTELLIGENCE */}
            <div
              className="content-panel risk-panel"
              id="risk"
            >
              <div className="panel-heading">
                <div>
                  <span className="panel-eyebrow">
                    PORTFOLIO MONITORING
                  </span>

                  <h3>Risk Intelligence</h3>

                  <p>Current portfolio health indicators</p>
                </div>

                <ShieldCheck
                  size={21}
                  className="risk-icon"
                />
              </div>

              <div className="risk-score">
                <div>
                  <span>OVERALL RISK LEVEL</span>
                  <h2>Moderate</h2>
                </div>

                <div className="risk-badge">
                  68 / 100
                </div>
              </div>

              <div className="risk-meter">
                <div></div>
              </div>

              <div className="risk-scale">
                <span>LOW</span>
                <span>MODERATE</span>
                <span>HIGH</span>
              </div>

              <div className="risk-insight">
                <Zap size={17} />

                <p>
                  Portfolio is currently operating within its defined risk parameters.
                </p>
              </div>
            </div>

            {/* PORTFOLIO ACTIVITY */}
            <div
              className="content-panel activity-panel"
              id="activity"
            >
              <div className="panel-heading">
                <div>
                  <span className="panel-eyebrow">
                    LATEST UPDATES
                  </span>

                  <h3>Portfolio Activity</h3>

                  <p>Recent account events</p>
                </div>

                <button className="panel-more">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="activity-list">
                {activities.map((item) => (
                  <div
                    className="activity-item"
                    key={item.title}
                  >
                    <div
                      className={`activity-icon ${item.type}`}
                    >
                      {item.type === 'adjust' && (
                        <ChartNoAxesCombined size={17} />
                      )}

                      {item.type === 'income' && (
                        <ArrowDownRight size={17} />
                      )}

                      {item.type === 'risk' && (
                        <ShieldCheck size={17} />
                      )}
                    </div>

                    <div className="activity-description">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>

                    <div className="activity-time">
                      <Clock3 size={12} />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>

              <button className="activity-link">
                View complete activity log
                <ArrowUpRight size={15} />
              </button>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="dashboard-footer">
            <span>
              MERIDIAN CAPITAL INTELLIGENCE © 2026
            </span>

            <span>
              Illustrative portfolio data · Last updated today
            </span>
          </footer>
        </div>

        {/* ADD POSITION MODAL */}
        {showModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false)
              }
            }}
          >
            <div className="position-modal">

              <div className="modal-header">
                <div>
                  <span className="panel-eyebrow">
                    PORTFOLIO MANAGEMENT
                  </span>

                  <h2>Add New Position</h2>

                  <p>
                    Enter your investment details below.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={addPosition}>

                <label>Asset Name</label>

                <input
                  required
                  placeholder="e.g. Apple Inc."
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <label>Stock Symbol</label>

                <input
                  required
                  placeholder="e.g. AAPL"
                  value={form.symbol}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      symbol: e.target.value,
                    })
                  }
                />

                <label>Asset Class</label>

                <select
                  value={form.assetClass}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      assetClass: e.target.value as AssetClass,
                    })
                  }
                >
                  {assetClasses.map((assetClass) => (
                    <option
                      key={assetClass}
                      value={assetClass}
                    >
                      {assetClass}
                    </option>
                  ))}
                </select>

                <div className="modal-fields">

                  <div>
                    <label>Quantity</label>

                    <input
                      required
                      type="number"
                      min="0.0001"
                      step="any"
                      placeholder="10"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label>Purchase Price ($)</label>

                    <input
                      required
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="150"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <label>Current Market Price ($)</label>

                <input
                  required
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="165"
                  value={form.currentPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentPrice: e.target.value,
                    })
                  }
                />

                <button
                  type="submit"
                  className="accent-button modal-submit"
                >
                  <Plus size={17} />
                  Add Investment
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
