import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle, ChevronLeft, Clock, DollarSign, FileText,
  Gavel, MessageSquare, Plus, Send, Upload, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import api, { DisputeItem, Project } from "./api.disputes";

/* ─── helpers ─── */

const statusColor: Record<string, string> = {
  pending_payment: "bg-gray-500 text-white",
  open: "bg-blue-600 text-white",
  under_review: "bg-yellow-600 text-white",
  awaiting_response: "bg-orange-500 text-white",
  resolved: "bg-green-600 text-white",
  escalated: "bg-red-600 text-white",
  withdrawn: "bg-gray-400 text-white",
};

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ════════════════════════════════════ */
/*          MAIN COMPONENT             */
/* ════════════════════════════════════ */

const DisputeDashboard = () => {
  const navigate = useNavigate();

  /* ── state ── */
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selected, setSelected] = useState<DisputeItem | null>(null);

  /* create form */
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    projectId: "",
    category: "",
    reason: "",
    amountInDispute: 0,
  });

  /* respond form */
  const [responseText, setResponseText] = useState("");
  const [respondOpen, setRespondOpen] = useState(false);

  /* chat */
  const [chatMsg, setChatMsg] = useState("");

  /* evidence form */
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({
    type: "file" as "file" | "screenshot" | "chat_log" | "contract" | "milestone" | "other",
    title: "",
    description: "",
    url: "",
  });

  /* detect role from cookie/token (fallback to client) */
  const getUserId = () => localStorage.getItem("Chatting_id") || "";

  /* ── fetch ── */
  const fetchDisputes = async () => {
    setLoading(true);
    const data = await api.getMyDisputes(statusFilter === "all" ? undefined : statusFilter);
    setDisputes(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!getUserId()) {
      toast.error("Please sign in");
      navigate("/sign-in", { replace: true });
      return;
    }
    fetchDisputes();
  }, [statusFilter]);

  /* ── open detail ── */
  const openDetail = async (id: string) => {
    const d = await api.getDispute(id);
    if (d) {
      setSelected(d);
      setView("detail");
    }
  };

  /* ── open create ── */
  const openCreate = async () => {
    // try to detect role from last dispute or default
    const clientProjects = await api.getMyProjects("client");
    const freelancerProjects = await api.getMyProjects("freelancer");
    setProjects([...clientProjects, ...freelancerProjects]);
    setView("create");
  };

  /* ── submit create ── */
  const submitDispute = async () => {
    if (!form.projectId) { toast.error("Select a project"); return; }
    if (!form.category) { toast.error("Select a category"); return; }
    if (!form.reason || form.reason.length < 50) { toast.error("Reason must be at least 50 characters"); return; }
    if (!form.amountInDispute || form.amountInDispute <= 0) { toast.error("Amount is required"); return; }

    const result = await api.fileDispute(form);
    if (result.success) {
      toast.success("Dispute filed! Pay arbitration fee to activate.");
      if (result.paymentLink) {
        window.open(result.paymentLink, "_blank");
      }
      setForm({ projectId: "", category: "", reason: "", amountInDispute: 0 });
      setView("list");
      fetchDisputes();
    }
  };

  /* ── respond ── */
  const submitResponse = async () => {
    if (!selected) return;
    if (!responseText || responseText.length < 50) { toast.error("Response must be at least 50 characters"); return; }
    const ok = await api.submitResponse(selected._id, responseText);
    if (ok) {
      setRespondOpen(false);
      setResponseText("");
      const d = await api.getDispute(selected._id);
      if (d) setSelected(d);
    }
  };

  /* ── withdraw ── */
  const withdrawDispute = async () => {
    if (!selected) return;
    const ok = await api.withdraw(selected._id);
    if (ok) {
      setView("list");
      setSelected(null);
      fetchDisputes();
    }
  };

  /* ── chat ── */
  const sendMessage = async () => {
    if (!selected || !chatMsg.trim()) return;
    const logs = await api.sendMessage(selected._id, chatMsg);
    if (logs) {
      setSelected((prev) => prev ? { ...prev, chatLogs: logs } : prev);
      setChatMsg("");
    }
  };

  /* ── evidence ── */
  const submitEvidence = async () => {
    if (!selected) return;
    if (!evidenceForm.title.trim()) { toast.error("Title is required"); return; }
    if (!evidenceForm.url.trim()) { toast.error("URL / link is required"); return; }
    const ok = await api.addEvidence(selected._id, evidenceForm);
    if (ok) {
      setEvidenceOpen(false);
      setEvidenceForm({ type: "file", title: "", description: "", url: "" });
      const d = await api.getDispute(selected._id);
      if (d) setSelected(d);
    }
  };

  /* ════════════════ CREATE VIEW ════════════════ */
  if (view === "create") {
    return (
      <div className="container mx-auto py-10 px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => setView("list")} className="mb-4 gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
            <CardTitle className="text-xl flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> File a Dispute</CardTitle>
            <CardDescription>Select the project and describe the issue in detail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-1.5">
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {["quality", "deadline", "scope", "payment", "communication", "fraud", "other"].map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount in Dispute (₹) *</Label>
              <Input type="number" min={1} value={form.amountInDispute || ""}
                onChange={(e) => setForm((f) => ({ ...f, amountInDispute: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Reason * (min 50 chars)</Label>
              <Textarea rows={5} value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Describe the issue in detail…" />
              <p className="text-xs text-muted-foreground text-right">{form.reason.length}/50 min</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={submitDispute}>Submit Dispute</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  /* ════════════════ DETAIL VIEW ════════════════ */
  if (view === "detail" && selected) {
    const d = selected;
    const userId = getUserId();
    const isFiler = typeof d.filedBy === "object" ? d.filedBy._id === userId : d.filedBy === userId;
    const isRespondent = typeof d.filedAgainst === "object" ? d.filedAgainst._id === userId : d.filedAgainst === userId;
    const isClosed = ["resolved", "withdrawn"].includes(d.status);

    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => { setView("list"); setSelected(null); }} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Back to My Disputes
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold">{d.disputeNumber}</h2>
            <p className="text-muted-foreground">{d.projectId?.title}</p>
          </div>
          <Badge className={statusColor[d.status]}>{d.status.replace(/_/g, " ")}</Badge>
        </div>

        {/* Quick Info */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-bold">₹{d.amountInDispute?.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="capitalize font-semibold">{d.category}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Filed</p>
              <p className="font-semibold">{fmt(d.createdAt)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Arbitration Fee Banner */}
        {d.status === "pending_payment" && isFiler && d.arbitrationPaymentLink && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-semibold">Arbitration Fee: ₹{d.arbitrationFee}</p>
                <p className="text-sm text-muted-foreground">Pay to activate the dispute.</p>
              </div>
              <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                <a href={d.arbitrationPaymentLink} target="_blank" rel="noreferrer">Pay Now</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="chat">Chat ({d.chatLogs?.length || 0})</TabsTrigger>
            <TabsTrigger value="evidence">Evidence ({d.evidence?.length || 0})</TabsTrigger>
            {d.resolution && <TabsTrigger value="resolution">Resolution</TabsTrigger>}
          </TabsList>

          {/* Details */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Reason</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm">{d.reason}</p></CardContent>
            </Card>

            {d.respondentResponse?.response && (
              <Card>
                <CardHeader><CardTitle className="text-base">Response</CardTitle></CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{d.respondentResponse.response}</p>
                  <p className="text-xs text-muted-foreground mt-2">Submitted {fmt(d.respondentResponse.submittedAt)}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Response Deadline</p>
                    <p className="font-mono text-sm">{fmt(d.responseDeadline)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Resolution Deadline</p>
                    <p className="font-mono text-sm">{fmt(d.resolutionDeadline)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            {!isClosed && (
              <div className="flex gap-2 flex-wrap">
                {isRespondent && !d.respondentResponse?.response && (
                  <Button size="sm" onClick={() => setRespondOpen(true)}>
                    <MessageSquare className="h-4 w-4 mr-1" /> Submit Response
                  </Button>
                )}
                {isFiler && (
                  <Button size="sm" variant="destructive" onClick={withdrawDispute}>
                    <XCircle className="h-4 w-4 mr-1" /> Withdraw
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Chat */}
          <TabsContent value="chat" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="max-h-80 overflow-y-auto space-y-3 mb-4 border rounded-md p-3 bg-muted/30">
                  {d.chatLogs?.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No messages yet.</p>}
                  {d.chatLogs?.map((m, i) => {
                    const isMe = m.sender === userId;
                    return (
                      <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-xs font-medium capitalize text-muted-foreground">{m.senderRole}{isMe ? " (You)" : ""}</span>
                        <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${isMe ? "bg-blue-100 dark:bg-blue-900" : "bg-white dark:bg-gray-800 border"}`}>
                          {m.message}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(m.timestamp).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                {!isClosed && (
                  <div className="flex gap-2">
                    <Input placeholder="Type a message…" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1" />
                    <Button size="sm" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence */}
          <TabsContent value="evidence" className="space-y-3 mt-4">
            {!isClosed && (
              <Button size="sm" variant="outline" onClick={() => setEvidenceOpen(true)} className="gap-1 mb-2">
                <Upload className="h-4 w-4" /> Add Evidence
              </Button>
            )}
            {d.evidence?.length === 0 && <p className="text-muted-foreground">No evidence submitted yet.</p>}
            {d.evidence?.map((e) => (
              <Card key={e._id}>
                <CardContent className="flex items-start gap-3 py-4">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{e.title} <Badge variant="outline" className="ml-1 text-xs">{e.type}</Badge></p>
                    {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                    <a href={e.url} target="_blank" rel="noreferrer" className="text-blue-500 text-sm underline">View →</a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Resolution */}
          {d.resolution && (
            <TabsContent value="resolution" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5" /> Resolution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Decision:</strong> <Badge className="capitalize">{d.resolution.decision?.replace(/_/g, " ")}</Badge></p>
                  {d.resolution.awardedAmount > 0 && <p><strong>Awarded:</strong> ₹{d.resolution.awardedAmount?.toLocaleString()}</p>}
                  {d.resolution.refundAmount > 0 && <p><strong>Refund:</strong> ₹{d.resolution.refundAmount?.toLocaleString()}</p>}
                  <p><strong>Reasoning:</strong></p>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{d.resolution.reasoning}</p>
                  <p className="text-xs text-muted-foreground">Resolved {fmt(d.resolution.resolvedAt)}</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Respond Dialog */}
        <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Your Response</DialogTitle></DialogHeader>
            <Textarea rows={5} value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Your response (min 50 chars)…" />
            <p className="text-xs text-muted-foreground text-right">{responseText.length}/50 min</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRespondOpen(false)}>Cancel</Button>
              <Button onClick={submitResponse}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Evidence Dialog */}
        <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Evidence</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={evidenceForm.type} onValueChange={(v: any) => setEvidenceForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["file", "screenshot", "chat_log", "contract", "milestone", "other"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input value={evidenceForm.title} onChange={(e) => setEvidenceForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Signed contract" />
              </div>
              <div className="space-y-1.5">
                <Label>URL / Link *</Label>
                <Input value={evidenceForm.url} onChange={(e) => setEvidenceForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://… or S3 link" />
              </div>
              <div className="space-y-1.5">
                <Label>Description (optional)</Label>
                <Textarea rows={3} value={evidenceForm.description} onChange={(e) => setEvidenceForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of this evidence…" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEvidenceOpen(false)}>Cancel</Button>
              <Button onClick={submitEvidence}>Submit Evidence</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ════════════════ LIST VIEW ════════════════ */
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Disputes</h2>
        <Button onClick={openCreate} className="gap-1 bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4" /> File Dispute
        </Button>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {["pending_payment", "open", "under_review", "awaiting_response", "resolved", "escalated", "withdrawn"].map((s) => (
            <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* List */}
      {loading ? (
        <p className="text-center py-10 text-muted-foreground">Loading…</p>
      ) : disputes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No disputes found</p>
            <p className="text-sm text-muted-foreground mb-4">You don't have any disputes yet.</p>
            <Button onClick={openCreate} variant="outline">File a Dispute</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Card key={d._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(d._id)}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold">{d.disputeNumber}</span>
                    <Badge className={statusColor[d.status] + " text-xs"}>{d.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-sm truncate">{d.projectId?.title || "Untitled Project"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.category} · {fmt(d.createdAt)}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold">₹{d.amountInDispute?.toLocaleString()}</p>
                  <Button size="sm" variant="outline" className="mt-1">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisputeDashboard;
