import React, { useState, useEffect } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/router";
import { FiEye, FiCopy, FiDollarSign } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { fetchIncomeByEmployeeId } from "@/redux/slices/incomesSlice";

const Income = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const router = useRouter();
  const dispatch = useDispatch();
  const { incomes, loading, error } = useSelector((state) => state.incomes);

  useEffect(() => {
    dispatch(fetchIncomeByEmployeeId());
  }, [dispatch]);

  // Status color mapping
  const statusColors = {
    Pending: '#FFF7C2',
    Approved: '#C2FFC2',
    Rejected: '#FFC2C2',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const handleRowClick = (income) => {
    router.push(`/employee/add-income?id=${income.incomeId}`);
  };

  // Empty state component
  const EmptyState = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      marginTop: 16
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
      }}>
        <FiDollarSign size={32} color="#6b7280" />
      </div>
      <h3 style={{
        fontSize: 18,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 8
      }}>
        No Income Records Found
      </h3>
      <p style={{
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        maxWidth: 400,
        marginBottom: 24
      }}>
        You haven't submitted any income records yet. Click the button below to add your first income record.
      </p>
      <button
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        onClick={() => router.push('/employee/add-income')}
      >
        Add Your First Income
      </button>
    </div>
  );

  return (
    <>
      <HradminNavbar />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div style={{ marginLeft: isSidebarCollapsed ? 64 : 220, marginTop: 48, padding: '32px 32px 32px 32px', background: '#fafbfc', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: 22, color: '#374151' }}>Income</h2>
          <button
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginLeft: 16 }}
            onClick={() => router.push('/employee/add-income')}
          >
            Add Income
          </button>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            marginTop: 16
          }}>
            <div style={{ color: '#6b7280', fontSize: 16 }}>Loading income records...</div>
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            marginTop: 16
          }}>
            <div style={{ color: '#ef4444', fontSize: 16 }}>Error: {error}</div>
          </div>
        ) : incomes.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 0, marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f5f6fa', textAlign: 'left' }}>
                  <th style={{ padding: '16px 12px' }}>Project</th>
                  <th style={{ padding: '16px 12px' }}>Client</th>
                  <th style={{ padding: '16px 12px' }}>Amount</th>
                  <th style={{ padding: '16px 12px' }}>Initiated</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', verticalAlign: 'middle' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => handleRowClick(row)}
                    onMouseOver={e => e.currentTarget.style.background = '#f5f6fa'}
                    onMouseOut={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '14px 12px' }}>{row.project}</td>
                    <td style={{ padding: '14px 12px' }}>{row.client}</td>
                    <td style={{ padding: '14px 12px' }}>{row.amount}</td>
                    <td style={{ padding: '14px 12px' }}>{formatDate(row.initiated)}</td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{ background: statusColors[row.status], color: '#444', borderRadius: 12, padding: '4px 16px', fontWeight: 500, fontSize: 15 }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <FiEye className="w-5 h-5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuth(Income);  