import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

interface Campaign {
  id: number;
  name: string;
  subtitle: string;
  status: { label: string; color: string };
  recipients: number;
  openRate: number;
  clickRate: number;
  date: string;
}

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { data: campaign, isLoading, isError } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/campaigns/${id}`);
      return res.json();
    },
  });
  // Only use the status string in the form
  type CampaignForm = Omit<Campaign, 'status'> & { status: string };
  const [form, setForm] = useState<CampaignForm | null>(null);

  useEffect(() => {
    if (campaign) {
      setForm({
        ...campaign,
        status: typeof campaign.status === 'object' ? campaign.status.label.toLowerCase() : campaign.status
      });
    }
  }, [campaign]);

  const mutation = useMutation({
    mutationFn: async (data: CampaignForm) => {
      return await apiRequest("PATCH", `/api/campaigns/${id}`, data);
    },
    onSuccess: () => {
      setLocation(`/campaigns/${id}`);
    },
  });

  if (isLoading || !form) return <div>Loading...</div>;
  if (isError || !campaign) return <div>Campaign not found</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Campaign</h1>
      <form onSubmit={e => {
        e.preventDefault();
        mutation.mutate(form);
      }}>
        <div className="mb-2">
          <label>Name: <input className="border p-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
        </div>
        <div className="mb-2">
          <label>Subtitle: <input className="border p-1" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} /></label>
        </div>
        <div className="mb-2">
          <label>
            Status:
            <select
              className="border p-1"
              value={form.status}
              onChange={e => setForm(f => f && ({ ...f, status: e.target.value }))}
            >
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </label>
        </div>
        <div className="mb-2">
          <label>Recipients: <input className="border p-1" type="number" value={form.recipients} onChange={e => setForm(f => ({ ...f, recipients: Number(e.target.value) }))} /></label>
        </div>
        <div className="mb-2">
          <label>Open Rate: <input className="border p-1" type="number" value={form.openRate} onChange={e => setForm(f => ({ ...f, openRate: Number(e.target.value) }))} /></label>
        </div>
        <div className="mb-2">
          <label>Click Rate: <input className="border p-1" type="number" value={form.clickRate} onChange={e => setForm(f => ({ ...f, clickRate: Number(e.target.value) }))} /></label>
        </div>
        <div className="mb-2">
          <label>Date: <input className="border p-1" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></label>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
      <Toaster />
    </div>
  );
}
