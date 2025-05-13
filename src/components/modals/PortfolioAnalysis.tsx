import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChartBar, ChartLine, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountryFlagIcon from "./CountryFlagIcon";
import {
  getPortfolioReport,
  PortfolioReport,
  hasExceededFreeTierLimit,
  groupViewsByCountry,
  groupViewsByMonth,
  groupViewsByYear,
} from "@/components/modals/portfolioService";
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
} from "recharts";

interface PortfolioAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
}

const PortfolioAnalyticsModal: React.FC<PortfolioAnalyticsModalProps> = ({
  isOpen,
  onClose,
  freelancerId,
}) => {
  const [reportData, setReportData] = useState<PortfolioReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"day" | "month" | "year">(
    "month"
  );

  const FREE_TIER_LIMIT = 1500;

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !freelancerId) return;

      setLoading(true);
      try {
        const data = await getPortfolioReport(freelancerId);
        setReportData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load portfolio analytics. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, freelancerId]);

  // Prepare chart data based on time filter
  const prepareChartData = () => {
    if (!reportData?.viewDetails) return [];

    let groupedData: Record<string, number> = {};

    switch (timeFilter) {
      case "day":
        // Group by day (last 30 days)
        groupedData = reportData.viewDetails.reduce((acc, view) => {
          const date = new Date(view.timestamp);
          const day = date.toISOString().split("T")[0];
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        break;
      case "month":
        groupedData = groupViewsByMonth(reportData.viewDetails);
        break;
      case "year":
        groupedData = groupViewsByYear(reportData.viewDetails);
        break;
    }

    return Object.entries(groupedData).map(([time, count]) => ({
      name: time,
      views: count,
    }));
  };

  // Prepare country data for visualization
  const prepareCountryData = () => {
    if (!reportData?.viewDetails) return [];

    const countryData = groupViewsByCountry(reportData.viewDetails);

    return Object.entries(countryData)
      .map(([country, count]): { name: string; value: number } => ({
        name: country,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const countryData = prepareCountryData();
  const timeData = prepareChartData();
  const isExceededLimit = reportData
    ? hasExceededFreeTierLimit(reportData.viewCount)
    : false;
  const usagePercentage = reportData
    ? (reportData.viewCount / FREE_TIER_LIMIT) * 100
    : 0;

  const COLORS = [
    "#8B5CF6",
    "#D946EF",
    "#F97316",
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#8B5CF6",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Portfolio Analytics Dashboard
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : reportData ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <ChartLine className="h-4 w-4" /> Timeline
              </TabsTrigger>
              <TabsTrigger
                value="geography"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" /> Geography
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Portfolio Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {reportData.viewCount}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      All time portfolio views
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Free Tier Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mb-1">
                      <div className="text-2xl font-bold">
                        {reportData.viewCount} / {FREE_TIER_LIMIT}
                      </div>
                      <Badge
                        variant={isExceededLimit ? "destructive" : "secondary"}
                      >
                        {isExceededLimit ? "Limit Exceeded" : "Free Tier"}
                      </Badge>
                    </div>
                    <Progress
                      value={Math.min(usagePercentage, 100)}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {isExceededLimit
                        ? "You have exceeded your free tier limit. Please upgrade your plan."
                        : `${(
                            FREE_TIER_LIMIT - reportData.viewCount
                          ).toLocaleString()} views remaining in free tier`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {reportData.viewDetails.slice(0, 5).map((view, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="rounded-full p-2 bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {view.location.country && (
                              <CountryFlagIcon
                                countryCode={view.location.country}
                                className="w-5 h-auto"
                              />
                            )}
                            <span className="font-medium">
                              {view.location.city}, {view.location.region},{" "}
                              {view.location.country}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(view.timestamp).toLocaleString()} · IP:{" "}
                            {view.ip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Views Over Time</CardTitle>
                  <Select
                    value={timeFilter}
                    onValueChange={(value: "day" | "month" | "year") =>
                      setTimeFilter(value)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timeData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="#8B5CF6"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geography" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Views by Country</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={countryData.slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            outerRadius={80}
                            fill="#8B5CF6"
                            dataKey="value"
                          >
                            {countryData.slice(0, 8).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {countryData.slice(0, 10).map((country, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-10 text-center">{index + 1}.</div>
                          <div className="flex items-center gap-2 flex-1">
                            <CountryFlagIcon countryCode={country.name} />
                            <span className="font-medium">{country.name}</span>
                          </div>
                          <div className="w-16 text-right">{String(country.value)}</div>
                          <div className="w-16 text-right text-muted-foreground text-sm">
                            {(
                              (Number(country.value) / reportData.viewCount) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        <DialogFooter>
          {isExceededLimit && (
            <Button variant="default" className="mr-auto">
              Upgrade Plan
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioAnalyticsModal;
