import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: campaign, isLoading, isError } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/campaigns/${id}`);
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !campaign) return <div>Campaign not found</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Campaign Details</h1>
      <div className="mb-2"><b>Name:</b> {campaign.name}</div>
      <div className="mb-2"><b>Subtitle:</b> {campaign.subtitle}</div>
      <div className="mb-2"><b>Status:</b> {campaign.status?.label}</div>
      <div className="mb-2"><b>Recipients:</b> {campaign.recipients}</div>
      <div className="mb-2"><b>Open Rate:</b> {campaign.openRate}%</div>
      <div className="mb-2"><b>Click Rate:</b> {campaign.clickRate}%</div>
      <div className="mb-2"><b>Date:</b> {campaign.date}</div>
      <Toaster />
    </div>
  );
}
