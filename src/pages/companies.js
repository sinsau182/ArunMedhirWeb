import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import SuperadminHeaders from "@/components/SuperadminHeaders";

export default function CompaniesPage() {
  const dispatch = useDispatch();
  const { companies, loading, err } = useSelector((state) => state.companies);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  return (
    <div>
      <SuperadminHeaders />
      <h1>Companies</h1>
      {loading && <p>Loading companies...</p>}
      {err && <p>Error: {err}</p>}
      <ul>
        {companies.map((company) => (
          <li key={company.id}>{company.name} - {company.email} - {company.phone} - {company.regAdd} - {company.gst}</li>
        ))}
      </ul>
    </div>
  );
}
