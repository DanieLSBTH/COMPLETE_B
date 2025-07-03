import React, { useEffect, useState, useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import api from '../../services/api';

// Constantes para colores y configuraciones
const CHART_COLORS = {
  KCAL: '--blue-500',
  ACIDEZ: '--red-500',
  REGISTROS: '--green-500'
};

export default function ResumenPasteurizacion() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Usamos useMemo para calcular los datos derivados solo cuando data cambia
    const { chartData, chartOptions, metricData } = useMemo(() => {
        if (!data.length) return { chartData: {}, chartOptions: {}, metricData: [] };
        
        const documentStyle = getComputedStyle(document.documentElement);
        
        // Calcular totales
        const totalKcal = data.reduce((acc, item) => acc + parseFloat(item.promedio_kcal_l), 0);
        const totalAcidez = data.reduce((acc, item) => acc + parseFloat(item.total_acidez), 0);
        const totalRegistros = data.reduce((acc, item) => acc + item.total_registros, 0);
        
        return {
            chartData: {
                labels: data.map(item => item.mes),
                datasets: [
                    {
                        type: 'line',
                        label: 'Promedio Kcal/L',
                        borderColor: documentStyle.getPropertyValue(CHART_COLORS.KCAL),
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.KCAL + '20'),
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        data: data.map(item => parseFloat(item.promedio_kcal_l)),
                        pointStyle: 'circle',
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        type: 'bar',
                        label: 'Total Acidez',
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.ACIDEZ),
                        data: data.map(item => parseFloat(item.total_acidez)),
                        borderColor: 'white',
                        borderWidth: 2,
                        borderRadius: 4
                    },
                    {
                        type: 'bar',
                        label: 'Total Registros',
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.REGISTROS),
                        data: data.map(item => item.total_registros),
                        borderRadius: 4
                    }
                ]
            },
            chartOptions: {
                maintainAspectRatio: false,
                aspectRatio: 0.6,
                plugins: {
                    legend: {
                        labels: {
                            color: documentStyle.getPropertyValue('--text-color'),
                            usePointStyle: true,
                            padding: 15
                        },
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color-secondary')
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            },
            metricData: [
                { label: 'Total Prom. Kcal/L', color: documentStyle.getPropertyValue(CHART_COLORS.KCAL), value: totalKcal.toFixed(2), icon: 'pi pi-chart-line' },
                { label: 'Total Acidez', color: documentStyle.getPropertyValue(CHART_COLORS.ACIDEZ), value: totalAcidez.toFixed(2), icon: 'pi pi-exclamation-circle' },
                { label: 'Total Registros', color: documentStyle.getPropertyValue(CHART_COLORS.REGISTROS), value: totalRegistros, icon: 'pi pi-database' }
            ]
        };
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/trabajo_de_pasteurizaciones/getStats/');
                setData(response.data);
                setError(null);
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setError('No se pudieron cargar los datos. Intenta nuevamente más tarde.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center p-5">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                <span className="ml-2">Cargando datos...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 surface-card border-round shadow-2 text-center text-danger">
                <i className="pi pi-exclamation-triangle mr-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h3 className="text-center">Resumen de Pasteurización por Mes</h3>
                    <div className="flex justify-content-center mb-4">
                        <MeterGroup values={metricData} />
                    </div>
                    <div style={{ height: '500px', marginBottom: '50px' }}>
                        <Chart type="bar" data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
