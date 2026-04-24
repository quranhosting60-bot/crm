"use client";

import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch("/api/leads")
      .then(res => res.json())
      .then(data => setLeads(data.documents || []));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Leads Page</h1>

      {leads.length === 0 ? (
        <p>No data</p>
      ) : (
        leads.map((lead: any) => (
          <div key={lead.$id}>
            {lead.phone} - {lead.country}
          </div>
        ))
      )}
    </div>
  );
}