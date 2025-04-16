import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplateTest() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/templates')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Templates loaded:", data);
        setTemplates(data);
        setError(null);
      })
      .catch(err => {
        console.error("Error loading templates:", err);
        setError(err.message || "Failed to load templates");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Template Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">This is a simple test page to check if we can fetch templates without authentication.</p>
            <p className="text-gray-600 mb-6">Status: {loading ? 'Loading...' : error ? `Error: ${error}` : `Loaded ${templates.length} templates`}</p>
          </div>

          {!loading && !error && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Templates:</h3>
              {templates.length > 0 ? (
                <ul className="space-y-2">
                  {templates.map((template, index) => (
                    <li key={template.id || index} className="p-3 bg-gray-100 rounded-md">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-gray-600">ID: {template.id}</p>
                      <p className="text-sm text-gray-600">Category: {template.category}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No templates found</p>
              )}
            </div>
          )}

          <div className="mt-8">
            <Button 
              variant="default" 
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}