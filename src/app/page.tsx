"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Lock, 
  Unlock, 
  Settings, 
  Sun, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface Standing {
  userId: string;
  name: string;
  totalPoints: number;
  exactMatchesCount: number;
  rank: number;
  trend: "up" | "down" | "stable";
}

interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  stage: string;
  homeGoals: number | null;
  awayGoals: number | null;
  isFinished: boolean;
}

interface Prediction {
  id: string;
  userId: string;
  userName: string;
  fixtureId: string;
  homeBet: number | null;
  awayBet: number | null;
  pointsEarned: number | null;
  isMasked: boolean;
}

const FAMILY_MEMBERS = [
  "Yuliya", "Jasmine", "Max", "Omar", "Simone", 
  "Ursula", "Thomas", "Sebastian", "Zakee", "Leila"
];

export default function Home() {
  // Theme & Mounted States
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState<boolean>(false);

  // App Layout States - activeTab is the primary state.
  const [activeTab, setActiveTab] = useState<string>("leaderboard");

  // Data States
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Admin Security States
  const [adminPin, setAdminPin] = useState<string>("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  // Accordion state for All Predictions match breakdown
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});

  // Form inputs for predictions
  const [betInputs, setBetInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [betSavings, setBetSavings] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  // Form inputs for admin results
  const [adminInputs, setAdminInputs] = useState<Record<string, { home: string; away: string; isFinished: boolean }>>({});
  const [adminSavings, setAdminSavings] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  // Load Theme Preference on Mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      localStorage.setItem("theme", "dark");
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }

    // Restore last selected tab if any
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }

    // Load initial data
    loadInitialData();
  }, []);

  // Sync predictions whenever the active tab changes (or when it loads)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("activeTab", activeTab);
      if (FAMILY_MEMBERS.includes(activeTab)) {
        fetchPredictions(activeTab);
      } else {
        fetchPredictions("");
      }
    }
  }, [activeTab]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Fixtures
      const fixturesRes = await fetch("/api/fixtures");
      const fixturesData = await fixturesRes.json();
      if (Array.isArray(fixturesData)) {
        setFixtures(fixturesData);

        // Prepopulate Admin inputs
        const initialAdminInputs: Record<string, { home: string; away: string; isFinished: boolean }> = {};
        fixturesData.forEach((fix: Fixture) => {
          initialAdminInputs[fix.id] = {
            home: fix.homeGoals !== null ? fix.homeGoals.toString() : "",
            away: fix.awayGoals !== null ? fix.awayGoals.toString() : "",
            isFinished: fix.isFinished,
          };
        });
        setAdminInputs(initialAdminInputs);
      } else {
        console.error("Fixtures data is not an array:", fixturesData);
      }

      // 2. Fetch Leaderboard (standings & progression)
      const leaderboardRes = await fetch("/api/leaderboard");
      const leaderboardData = await leaderboardRes.json();
      if (leaderboardData && !leaderboardData.error) {
        setStandings(leaderboardData.standings || []);
        setChartData(leaderboardData.chartData || []);
        setUsersList(leaderboardData.usersList || []);
      }

      // 3. Fetch Predictions for active tab
      const isMemberTab = FAMILY_MEMBERS.includes(activeTab);
      await fetchPredictions(isMemberTab ? activeTab : "");
    } catch (error) {
      console.error("Error loading tournament data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPredictions = async (viewerName: string) => {
    try {
      const res = await fetch(`/api/predictions?viewer=${encodeURIComponent(viewerName)}`);
      if (res.ok) {
        const predictionsData = await res.json();
        if (Array.isArray(predictionsData)) {
          setPredictions(predictionsData);

          // Prepopulate Bet inputs for predictions if we are on a member's tab
          if (viewerName) {
            const initialBets: Record<string, { home: string; away: string }> = {};
            predictionsData.forEach((pred: Prediction) => {
              if (pred.userName.toLowerCase() === viewerName.toLowerCase()) {
                initialBets[pred.fixtureId] = {
                  home: pred.homeBet !== null ? pred.homeBet.toString() : "",
                  away: pred.awayBet !== null ? pred.awayBet.toString() : "",
                };
              }
            });
            setBetInputs(initialBets);
          }
        } else {
          console.error("Predictions data is not an array:", predictionsData);
        }
      }
    } catch (error) {
      console.error("Error loading predictions:", error);
    }
  };

  // Submit Prediction for selected player tab
  const submitPrediction = async (fixtureId: string, playerName: string) => {
    const inputs = betInputs[fixtureId];
    if (!inputs || inputs.home === "" || inputs.away === "") {
      alert("Please enter scores for both teams before saving.");
      return;
    }

    setBetSavings(prev => ({ ...prev, [fixtureId]: "saving" }));

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: playerName,
          fixtureId,
          homeBet: parseInt(inputs.home),
          awayBet: parseInt(inputs.away),
        }),
      });

      if (res.ok) {
        setBetSavings(prev => ({ ...prev, [fixtureId]: "saved" }));
        setTimeout(() => {
          setBetSavings(prev => ({ ...prev, [fixtureId]: "idle" }));
        }, 2000);
        
        // Refresh data to rebuild standings
        loadInitialData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save prediction");
        setBetSavings(prev => ({ ...prev, [fixtureId]: "error" }));
      }
    } catch (error) {
      console.error("Failed saving prediction:", error);
      setBetSavings(prev => ({ ...prev, [fixtureId]: "error" }));
    }
  };

  // Resolve Match Score (Admin)
  const resolveFixture = async (fixtureId: string) => {
    const inputs = adminInputs[fixtureId];
    if (!inputs) return;

    const { home, away, isFinished } = inputs;
    
    if (isFinished && (home === "" || away === "")) {
      alert("You must enter a score if marking the match as finished.");
      return;
    }

    setAdminSavings(prev => ({ ...prev, [fixtureId]: "saving" }));

    try {
      const res = await fetch("/api/fixtures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({
          fixtureId,
          homeGoals: home !== "" ? parseInt(home) : null,
          awayGoals: away !== "" ? parseInt(away) : null,
          isFinished,
        }),
      });

      if (res.ok) {
        setAdminSavings(prev => ({ ...prev, [fixtureId]: "saved" }));
        setTimeout(() => {
          setAdminSavings(prev => ({ ...prev, [fixtureId]: "idle" }));
        }, 2000);
        
        // Refresh to recalculate leaderboard standings and logs
        loadInitialData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save results");
        setAdminSavings(prev => ({ ...prev, [fixtureId]: "error" }));
      }
    } catch (error) {
      console.error("Failed saving admin result:", error);
      setAdminSavings(prev => ({ ...prev, [fixtureId]: "error" }));
    }
  };

  const handleAdminPinCheck = (val: string) => {
    setAdminPin(val);
    if (val === "9999") {
      setIsAdminUnlocked(true);
    } else {
      setIsAdminUnlocked(false);
    }
  };

  const toggleMatchExpanded = (fixtureId: string) => {
    setExpandedMatches(prev => ({
      ...prev,
      [fixtureId]: !prev[fixtureId],
    }));
  };

  const formatKickoff = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isMatchStarted = (isoString: string) => {
    return new Date(isoString) <= new Date();
  };

  const lineColors = [
    "#ffffff", "#a3a3a3", "#525252", "#737373", "#d4d4d4",
    "#e5e5e5", "#171717", "#262626", "#404040", "#f5f5f5"
  ];

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground min-h-screen transition-colors duration-200">
      {/* HEADER SECTION */}
      <header className="border-b border-border-custom px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-border-custom rounded font-mono text-sm font-bold bg-neutral-100 dark:bg-neutral-900">
            🏆 WC26
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase font-mono">
              World Cup 2026 Predictor
            </h1>
            <p className="text-xs uppercase text-neutral-400">
              Family Betting App // Shared Access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 border border-border-custom rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* HORIZONTAL SWIPE TAB BAR */}
      <nav className="border-b border-border-custom px-6 bg-card overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex space-x-2 py-2">
          {/* Main Tabs */}
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`py-2 px-4 border rounded font-mono text-xs uppercase tracking-wider transition-all ${
              activeTab === "leaderboard"
                ? "bg-foreground text-background font-bold border-foreground"
                : "border-border-custom text-neutral-400 hover:text-foreground"
            }`}
          >
            Leaderboard
          </button>

          <button
            onClick={() => setActiveTab("allPredictions")}
            className={`py-2 px-4 border rounded font-mono text-xs uppercase tracking-wider transition-all ${
              activeTab === "allPredictions"
                ? "bg-foreground text-background font-bold border-foreground"
                : "border-border-custom text-neutral-400 hover:text-foreground"
            }`}
          >
            All Predictions
          </button>

          <div className="border-l border-border-custom mx-2 self-stretch" />

          {/* Family Member Tabs */}
          {FAMILY_MEMBERS.map((member) => (
            <button
              key={member}
              onClick={() => setActiveTab(member)}
              className={`py-2 px-4 border rounded font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === member
                  ? "bg-foreground text-background font-bold border-foreground"
                  : "border-border-custom text-neutral-400 hover:text-foreground"
              }`}
            >
              {member}
            </button>
          ))}

          <div className="border-l border-border-custom mx-2 self-stretch" />

          {/* Admin Panel Tab */}
          <button
            onClick={() => setActiveTab("admin")}
            className={`py-2 px-4 border rounded font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-red-950 text-red-400 font-bold border-red-500"
                : "border-border-custom text-red-500/80 hover:text-red-400"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>
      </nav>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="font-mono text-xs uppercase animate-pulse">Loading tournament logs...</span>
          </div>
        )}

        {!isLoading && (
          <>
            {/* LEADERBOARD VIEW */}
            {activeTab === "leaderboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Standings Table */}
                <div className="lg:col-span-2 border border-border-custom rounded-lg bg-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-border-custom flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                      Current Rankings
                    </h2>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      Matches Resolved: {standings.length > 0 ? chartData.length - 1 : 0}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border-custom font-mono text-[10px] text-neutral-400 uppercase bg-neutral-100/50 dark:bg-neutral-900/30">
                          <th className="px-6 py-3 font-medium w-16">Rank</th>
                          <th className="px-4 py-3 font-medium w-16 text-center">Trend</th>
                          <th className="px-6 py-3 font-medium">Player</th>
                          <th className="px-6 py-3 font-medium text-center w-28">Exacts (4pt)</th>
                          <th className="px-6 py-3 font-medium text-right w-24">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-custom">
                        {standings.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-neutral-400 font-mono text-xs uppercase">
                              No matches finished yet. Standings will build as scores are resolved!
                            </td>
                          </tr>
                        ) : (
                          standings.map((row) => {
                            return (
                              <tr 
                                key={row.userId} 
                                className="transition-colors duration-150 hover:bg-neutral-50 dark:hover:bg-neutral-900/30"
                              >
                                <td className="px-6 py-4 font-mono text-xs">
                                  #{row.rank}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div 
                                    className="inline-flex justify-center items-center"
                                    title={row.trend === "up" ? "Rank Improved" : row.trend === "down" ? "Rank Dropped" : "Rank Stable"}
                                  >
                                    {row.trend === "up" && (
                                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    )}
                                    {row.trend === "down" && (
                                      <TrendingDown className="w-4 h-4 text-neutral-500" />
                                    )}
                                    {row.trend === "stable" && (
                                      <Minus className="w-3.5 h-3.5 text-neutral-400" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-semibold">
                                  {row.name}
                                </td>
                                <td className="px-6 py-4 text-center font-mono text-xs">
                                  {row.exactMatchesCount}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-sm font-bold">
                                  {row.totalPoints}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Standings Evolution Component */}
                <div className="border border-border-custom rounded-lg bg-card p-6 flex flex-col space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                      Standings Evolution
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Chronological cumulative points timeline match-by-match.
                    </p>
                  </div>

                  <div className="flex-1 min-h-[300px] flex items-center justify-center">
                    {chartData.length <= 1 ? (
                      <div className="text-center p-6 border border-dashed border-border-custom rounded font-mono text-xs text-neutral-400 uppercase w-full">
                        Need at least 1 finished match to plot standings history
                      </div>
                    ) : mounted ? (
                      <div className="w-full h-[300px] text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#222" : "#eee"} />
                            <XAxis 
                              dataKey="name" 
                              stroke={theme === "dark" ? "#888" : "#222"} 
                              tickLine={false}
                              axisLine={false}
                              dy={10}
                            />
                            <YAxis 
                              stroke={theme === "dark" ? "#888" : "#222"} 
                              tickLine={false}
                              axisLine={false}
                              dx={-10}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: theme === "dark" ? "#121212" : "#ffffff", 
                                borderColor: theme === "dark" ? "#262626" : "#e5e5e5",
                                color: theme === "dark" ? "#f5f5f5" : "#0a0a0a"
                              }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />
                            {usersList.map((user, index) => (
                              <Line
                                key={user}
                                type="monotone"
                                dataKey={user}
                                stroke={lineColors[index % lineColors.length]}
                                strokeWidth={user === activeTab ? 3 : 1.5}
                                activeDot={{ r: 6 }}
                                dot={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* MEMBER INDIVIDUAL TAB BETS VIEW */}
            {FAMILY_MEMBERS.includes(activeTab) && (
              <div className="border border-border-custom rounded-lg bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border-custom bg-neutral-50 dark:bg-neutral-900/50 flex justify-between items-center">
                  <div>
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                      Predictions for: {activeTab}
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Submit predictions for upcoming fixtures. Once kicked off, bets lock automatically.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono border border-border-custom px-2 py-0.5 rounded uppercase text-neutral-400">
                    Rule: end of 90/120 mins (before shootouts)
                  </span>
                </div>

                <div className="divide-y divide-border-custom">
                  {fixtures.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 font-mono text-xs uppercase">
                      No fixtures loaded.
                    </div>
                  ) : (
                    fixtures.map((fix) => {
                      const started = isMatchStarted(fix.kickoffTime);
                      const savedPrediction = predictions.find(
                        (p) => p.userName.toLowerCase() === activeTab.toLowerCase() && p.fixtureId === fix.id
                      );
                      
                      const inputState = betInputs[fix.id] || { home: "", away: "" };
                      const savingStatus = betSavings[fix.id] || "idle";

                      return (
                        <div 
                          key={fix.id} 
                          className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                            started ? "bg-neutral-50/30 dark:bg-neutral-950/10" : ""
                          }`}
                        >
                          {/* Fixture Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono border border-border-custom px-2 py-0.5 rounded uppercase tracking-wider text-neutral-400">
                                {fix.stage}
                              </span>
                              {started ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono text-red-500 border border-red-900/30 bg-red-950/10 px-1.5 py-0.2 rounded uppercase">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 border border-emerald-900/30 bg-emerald-950/10 px-1.5 py-0.2 rounded uppercase">
                                  <Unlock className="w-3 h-3" /> Active
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-xs text-neutral-400">
                              Kickoff: {formatKickoff(fix.kickoffTime)}
                            </div>
                          </div>

                          {/* Scores & Inputs */}
                          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            {/* Team Matchup */}
                            <div className="flex items-center gap-3 font-mono text-sm">
                              <span className="font-bold text-right w-24 md:w-32 truncate">{fix.homeTeam}</span>
                              
                              {/* Prediction Forms */}
                              {started ? (
                                // Read-Only Saved Prediction
                                <div className="flex items-center gap-1 px-3 py-1 border border-border-custom bg-neutral-100 dark:bg-neutral-900 rounded font-bold">
                                  {savedPrediction && savedPrediction.homeBet !== null && savedPrediction.awayBet !== null ? (
                                    <>
                                      <span>{savedPrediction?.homeBet}</span>
                                      <span className="text-neutral-400 font-normal">:</span>
                                      <span>{savedPrediction?.awayBet}</span>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-neutral-400 font-normal uppercase">No Bet</span>
                                  )}
                                </div>
                              ) : (
                                // Interactive Inputs
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    maxLength={2}
                                    placeholder="0"
                                    className="w-10 h-10 border border-border-custom bg-transparent rounded text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                                    value={inputState.home}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "");
                                      setBetInputs(prev => ({
                                        ...prev,
                                        [fix.id]: { ...inputState, home: val },
                                      }));
                                    }}
                                  />
                                  <span className="text-neutral-400 font-bold">:</span>
                                  <input
                                    type="text"
                                    maxLength={2}
                                    placeholder="0"
                                    className="w-10 h-10 border border-border-custom bg-transparent rounded text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                                    value={inputState.away}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "");
                                      setBetInputs(prev => ({
                                        ...prev,
                                        [fix.id]: { ...inputState, away: val },
                                      }));
                                    }}
                                  />
                                </div>
                              )}

                              <span className="font-bold text-left w-24 md:w-32 truncate">{fix.awayTeam}</span>
                            </div>

                            {/* Actions / points status */}
                            <div className="w-24 text-right">
                              {started ? (
                                // Show points status if match is finished
                                fix.isFinished ? (
                                  <div className="text-right">
                                    <span className="font-mono text-xs font-bold block">
                                      Result: {fix.homeGoals}-{fix.awayGoals}
                                    </span>
                                    <span className={`text-[10px] font-mono font-bold uppercase ${
                                      savedPrediction?.pointsEarned && savedPrediction.pointsEarned > 0 
                                        ? "text-emerald-500" 
                                        : "text-neutral-400"
                                    }`}>
                                      +{savedPrediction?.pointsEarned ?? 0} pts
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                                    Pending
                                  </span>
                                )
                              ) : (
                                // Show Save Button for active predictions
                                <button
                                  type="button"
                                  onClick={() => submitPrediction(fix.id, activeTab)}
                                  disabled={savingStatus === "saving"}
                                  className={`w-full py-2 px-3 rounded font-mono text-[10px] uppercase font-bold tracking-wider border border-border-custom transition-all ${
                                    savingStatus === "saved"
                                      ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                                      : savingStatus === "saving"
                                      ? "opacity-50 cursor-not-allowed"
                                      : "bg-foreground text-background hover:opacity-90 hover:scale-[1.02]"
                                  }`}
                                >
                                  {savingStatus === "saved" ? (
                                    <span className="flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Saved</span>
                                  ) : savingStatus === "saving" ? (
                                    "Saving..."
                                  ) : (
                                    "Save"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ALL PREDICTIONS SUMMARY VIEW */}
            {activeTab === "allPredictions" && (
              <div className="space-y-4">
                <div className="p-6 border border-border-custom rounded-lg bg-card space-y-1">
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                    All Predictions Summary
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Compare everyone's bets side-by-side. Predictions are masked with 🔒 until kickoff.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {fixtures.length === 0 ? (
                    <div className="p-8 border border-border-custom rounded-lg bg-card text-center text-neutral-400 font-mono text-xs uppercase">
                      No fixtures loaded.
                    </div>
                  ) : (
                    fixtures.map((fix) => {
                      const started = isMatchStarted(fix.kickoffTime);
                      const isExpanded = !!expandedMatches[fix.id];
                      
                      // Filter predictions for this match
                      const fixturePredictions = predictions.filter((p) => p.fixtureId === fix.id);

                      return (
                        <div 
                          key={fix.id} 
                          className="border border-border-custom rounded-lg bg-card overflow-hidden transition-all duration-150"
                        >
                          {/* Match Header Bar */}
                          <div 
                            onClick={() => toggleMatchExpanded(fix.id)}
                            className="p-4 md:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono border border-border-custom px-2 py-0.5 rounded uppercase tracking-wider text-neutral-400">
                                {fix.stage}
                              </span>
                              <span className="font-mono text-xs text-neutral-400">
                                {formatKickoff(fix.kickoffTime)}
                              </span>
                            </div>

                            {/* Teams Matchup */}
                            <div className="flex items-center gap-4 font-mono text-sm flex-1 justify-center">
                              <div className="text-right w-24 md:w-40 truncate font-bold">{fix.homeTeam}</div>
                              
                              <div className="px-3 py-1 border border-border-custom bg-neutral-50 dark:bg-neutral-950 rounded font-bold min-w-16 text-center">
                                {fix.isFinished ? (
                                  <span>{fix.homeGoals} - {fix.awayGoals}</span>
                                ) : (
                                  <span className="text-neutral-400 text-xs font-normal">VS</span>
                                )}
                              </div>

                              <div className="text-left w-24 md:w-40 truncate font-bold">{fix.awayTeam}</div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border-custom pt-3 md:pt-0">
                              <div className="text-xs font-mono text-neutral-400">
                                View predictions
                              </div>
                              
                              <div className="p-1 border border-border-custom rounded hover:bg-neutral-100 dark:hover:bg-neutral-900">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Predictions List */}
                          {isExpanded && (
                            <div className="border-t border-border-custom bg-neutral-50/50 dark:bg-neutral-950/20 p-6 space-y-4">
                              <div className="font-mono text-xs uppercase tracking-wider text-neutral-400 border-b border-border-custom pb-2">
                                Participant Predictions Breakdown
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {fixturePredictions.length === 0 ? (
                                  <div className="col-span-full py-4 text-center font-mono text-xs text-neutral-400 italic">
                                    No predictions made yet.
                                  </div>
                                ) : (
                                  fixturePredictions.map((pred) => {
                                    return (
                                      <div 
                                        key={pred.id} 
                                        className="p-3 border border-border-custom rounded bg-card flex items-center justify-between font-mono text-xs transition-all"
                                      >
                                        <div className="space-y-1">
                                          <span className="font-bold block">
                                            {pred.userName}
                                          </span>
                                          {fix.isFinished && pred.pointsEarned !== null && (
                                            <span className={`text-[10px] font-bold block ${
                                              pred.pointsEarned > 0 ? "text-emerald-500" : "text-neutral-400"
                                            }`}>
                                              +{pred.pointsEarned} pts {pred.pointsEarned === 4 && "🎯"}
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {pred.isMasked ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 border border-border-custom bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-400 rounded text-[10px] uppercase font-bold tracking-wider">
                                              <Lock className="w-3 h-3 text-neutral-400" /> Masked
                                            </div>
                                          ) : (
                                            <div className="px-2.5 py-1 border border-border-custom bg-neutral-100 dark:bg-neutral-900 rounded font-bold text-sm">
                                              {pred.homeBet}-{pred.awayBet}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ADMIN PANEL VIEW */}
            {activeTab === "admin" && (
              <div className="space-y-6">
                {/* Security Gate */}
                <div className="p-6 border border-border-custom rounded-lg bg-card space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Admin Security Lock
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Enter the Admin PIN (9999) to unlock score inputs and status controls.
                    </p>
                  </div>

                  <div className="w-full max-w-xs space-y-2">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      className="w-full h-10 px-3 border border-border-custom bg-transparent rounded focus:outline-none focus:ring-1 focus:ring-foreground text-center tracking-widest font-mono"
                      value={adminPin}
                      onChange={(e) => handleAdminPinCheck(e.target.value.replace(/\D/g, ""))}
                    />
                    {adminPin !== "" && !isAdminUnlocked && (
                      <span className="text-[10px] font-mono text-red-500 block text-center uppercase">
                        Invalid Admin PIN
                      </span>
                    )}
                    {isAdminUnlocked && (
                      <span className="text-[10px] font-mono text-emerald-500 block text-center uppercase font-bold">
                        ✓ Admin Panel Unlocked
                      </span>
                    )}
                  </div>
                </div>

                {/* Fixture Scoring Table */}
                <div className={`border border-border-custom rounded-lg bg-card overflow-hidden transition-all duration-300 ${
                  !isAdminUnlocked ? "opacity-40 pointer-events-none select-none filter blur-[1px]" : ""
                }`}>
                  <div className="px-6 py-4 border-b border-border-custom bg-neutral-50 dark:bg-neutral-900/50">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                      Tournament Score Manager
                    </h2>
                  </div>

                  <div className="divide-y divide-border-custom">
                    {fixtures.length === 0 ? (
                      <div className="p-8 text-center text-neutral-400 font-mono text-xs uppercase">
                        No fixtures to configure.
                      </div>
                    ) : (
                      fixtures.map((fix) => {
                        const inputs = adminInputs[fix.id] || { home: "", away: "", isFinished: false };
                        const savingStatus = adminSavings[fix.id] || "idle";

                        return (
                          <div key={fix.id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            {/* Fixture Detail */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono border border-border-custom px-2 py-0.5 rounded uppercase tracking-wider text-neutral-400">
                                {fix.stage}
                              </span>
                              <div className="font-mono text-sm font-bold">
                                {fix.homeTeam} vs {fix.awayTeam}
                              </div>
                              <div className="font-mono text-xs text-neutral-400">
                                Kickoff: {formatKickoff(fix.kickoffTime)}
                              </div>
                            </div>

                            {/* Inputs and actions */}
                            <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                              {/* Score Inputs */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <label className="text-[10px] font-mono text-neutral-400 uppercase mr-1">{fix.homeTeam}</label>
                                  <input
                                    type="text"
                                    maxLength={2}
                                    placeholder="-"
                                    className="w-11 h-10 border border-border-custom bg-transparent rounded text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                                    value={inputs.home}
                                    disabled={!isAdminUnlocked}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "");
                                      setAdminInputs(prev => ({
                                        ...prev,
                                        [fix.id]: { ...inputs, home: val },
                                      }));
                                    }}
                                  />
                                </div>

                                <span className="font-bold text-neutral-400">:</span>

                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    maxLength={2}
                                    placeholder="-"
                                    className="w-11 h-10 border border-border-custom bg-transparent rounded text-center font-mono text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                                    value={inputs.away}
                                    disabled={!isAdminUnlocked}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "");
                                      setAdminInputs(prev => ({
                                        ...prev,
                                        [fix.id]: { ...inputs, away: val },
                                      }));
                                    }}
                                  />
                                  <label className="text-[10px] font-mono text-neutral-400 uppercase ml-1">{fix.awayTeam}</label>
                                </div>
                              </div>

                              {/* Checkbox Status */}
                              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs select-none">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-border-custom text-neutral-900 focus:ring-0 focus:ring-offset-0 bg-transparent"
                                  checked={inputs.isFinished}
                                  disabled={!isAdminUnlocked}
                                  onChange={(e) => {
                                    setAdminInputs(prev => ({
                                      ...prev,
                                      [fix.id]: { ...inputs, isFinished: e.target.checked },
                                    }));
                                  }}
                                />
                                <span>Finished</span>
                              </label>

                              {/* Save Results */}
                              <button
                                type="button"
                                onClick={() => resolveFixture(fix.id)}
                                disabled={savingStatus === "saving" || !isAdminUnlocked}
                                className={`w-32 py-2 px-4 rounded font-mono text-[10px] uppercase font-bold tracking-wider border transition-all ${
                                  savingStatus === "saved"
                                    ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                                    : savingStatus === "saving"
                                    ? "opacity-50 cursor-not-allowed border-border-custom"
                                    : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500"
                                }`}
                              >
                                {savingStatus === "saved" ? (
                                  <span className="flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Resolved</span>
                                ) : savingStatus === "saving" ? (
                                  "Updating..."
                                ) : (
                                  "Save Result"
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
