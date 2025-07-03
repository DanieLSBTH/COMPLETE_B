import React, { useEffect, useState, useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import api from '../../services/api';

// Constantes para colores y configuraciones
const CHART_COLORS = {
  ESTIMULACIONES: '--blue-500',
  CONSTANTES: '--green-500',
  NUEVAS: '--orange-500'
};

// Mapeo de los nombres de los meses en inglés a español
const MONTH_MAP = {
  January: 'Enero',
  February: 'Febrero',
  March: 'Marzo',
  April: 'Abril',
  May: 'Mayo',
  June: 'Junio',
  July: 'Julio',
  August: 'Agosto',
  September: 'Septiembre',
  October: 'Octubre',
  November: 'Noviembre',
  December: 'Diciembre'
};

export default function BarsChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para traducir el mes de inglés a español
    const translateMonth = (dateString) => {
        return dateString.replace(/(\w+)\s+(\d+)/, (match, month, year) => {
            const cleanMonth = month.trim();
            return `${MONTH_MAP[cleanMonth] || cleanMonth} ${year}`;
        });
    };

    // Usamos useMemo para calcular los datos derivados solo cuando data cambia
    const { chartData, chartOptions, metricData } = useMemo(() => {
        if (!data.length) return { chartData: {}, chartOptions: {}, metricData: [] };
        
        const documentStyle = getComputedStyle(document.documentElement);
        
        // Calcular totales una sola vez
        const totalEstimulaciones = data.reduce((acc, item) => acc + item.totalEstimulaciones, 0);
        const totalConstantes = data.reduce((acc, item) => acc + item.totalConstantes, 0);
        const totalNuevas = data.reduce((acc, item) => acc + item.totalNuevas, 0);
        
        return {
            chartData: {
                labels: data.map(item => item.mes),
                datasets: [
                    {
                        type: 'line',
                        label: 'Estimulaciones',
                        borderColor: documentStyle.getPropertyValue(CHART_COLORS.ESTIMULACIONES),
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.ESTIMULACIONES + '20'),
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        data: data.map(item => item.totalEstimulaciones),
                        pointStyle: 'circle',
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        type: 'bar',
                        label: 'Constantes',
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.CONSTANTES),
                        data: data.map(item => item.totalConstantes),
                        borderColor: 'white',
                        borderWidth: 2,
                        borderRadius: 4
                    },
                    {
                        type: 'bar',
                        label: 'Nuevas',
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.NUEVAS),
                        data: data.map(item => item.totalNuevas),
                        borderRadius: 4
                    }
                ]
            },
            chartOptions: {
                maintainAspectRatio: false,
                aspectRatio: 0.6,
                plugins: {
                    tooltip: {
                        callbacks: {
                            // Personalizar el tooltip para mostrar información adicional
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    },
                    legend: {
                        labels: {
                            color: documentStyle.getPropertyValue('--text-color'),
                            usePointStyle: true,
                            padding: 15
                        },
                        position: 'top'
                    },
                    title: {
                        display: false,
                        text: 'Estimulaciones por Mes',
                        color: documentStyle.getPropertyValue('--text-color'),
                        font: {
                            size: 16
                        },
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color-secondary'),
                            // Configuración para etiquetas verticales
                            maxRotation: 0,
                            minRotation: 0,
                            padding: 10,
                            autoSkip: false,
                            align: 'start'
                        },
                        grid: {
                            color: documentStyle.getPropertyValue('--surface-border'),
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color-secondary')
                        },
                        grid: {
                            color: documentStyle.getPropertyValue('--surface-border'),
                            drawBorder: false
                        },
                        beginAtZero: true
                    }
                }
            },
            metricData: [
                { 
                    label: 'Total Estimulaciones', 
                    color: documentStyle.getPropertyValue(CHART_COLORS.ESTIMULACIONES), 
                    value: totalEstimulaciones, 
                    icon: 'pi pi-chart-line' 
                },
                { 
                    label: 'Total Constantes', 
                    color: documentStyle.getPropertyValue(CHART_COLORS.CONSTANTES), 
                    value: totalConstantes, 
                    icon: 'pi pi-refresh' 
                },
                { 
                    label: 'Total Nuevas', 
                    color: documentStyle.getPropertyValue(CHART_COLORS.NUEVAS), 
                    value: totalNuevas, 
                    icon: 'pi pi-user-plus' 
                }
            ]
        };
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/estimulacion/resumen_estimulacion/');
                
                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Formato de datos inválido');
                }
                
                const formattedData = response.data.map(item => ({
                    mes: translateMonth(item.mes || ''),
                    totalEstimulaciones: parseInt(item.total_estimulaciones, 10) || 0,
                    totalConstantes: parseInt(item.total_constantes, 10) || 0,
                    totalNuevas: parseInt(item.total_nuevas, 10) || 0
                }));
                
                // Ordenar los datos por fecha para una mejor visualización
                formattedData.sort((a, b) => {
                    const aDate = a.mes.split(' ');
                    const bDate = b.mes.split(' ');
                    const aYear = parseInt(aDate[1], 10);
                    const bYear = parseInt(bDate[1], 10);
                    
                    if (aYear !== bYear) return aYear - bYear;
                    
                    const aMonthIndex = Object.values(MONTH_MAP).indexOf(aDate[0]);
                    const bMonthIndex = Object.values(MONTH_MAP).indexOf(bDate[0]);
                    return aMonthIndex - bMonthIndex;
                });
                
                setData(formattedData);
                setError(null);
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setError('No se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.');
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
                    <h3 className="text-center">Resumen de Estimulaciones por Mes</h3>
                    <div className="flex justify-content-center mb-4">
                        <MeterGroup values={metricData} />
                    </div>
                    {/* Aumentando el espacio en la parte inferior para las etiquetas verticales */}
                    <div style={{ height: '500px', marginBottom: '50px' }}>
                        <Chart type="bar" data={chartData} options={chartOptions} />
                    </div>
                    <div className="mt-3 text-center text-xs text-500">
                        Las estimulaciones totales se muestran como línea para mejor visualización
                    </div>
                </div>
            </div>
        </div>
    );
}