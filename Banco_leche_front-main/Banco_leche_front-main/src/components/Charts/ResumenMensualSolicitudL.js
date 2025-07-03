import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import api from '../../services/api';

const ResumenMensualSolicitudL = () => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [resumenData, setResumenData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/solicitud_de_leches/resumen/por-mes/');
                const data = response.data;

                // Procesar datos por mes
                const formattedData = data.asistencia.reduce((acc, curr) => {
                    const month = Object.keys(curr).find(key => 
                        /\d{4}/.test(key) && key !== 'total' && key !== 'promedio'
                    );
                    
                    if (month) {
                        const existing = acc.find(item => item.mes === month);
                        if (existing) {
                            existing[curr.tipo] = parseFloat(curr[month]) || 0;
                        } else {
                            acc.push({
                                mes: month,
                                [curr.tipo]: parseFloat(curr[month]) || 0
                            });
                        }
                    }
                    return acc;
                }, []);

                // Configurar datos del gráfico
                const documentStyle = getComputedStyle(document.documentElement);
                
                setChartData({
                    labels: formattedData.map(item => item.mes),
                    datasets: [
                        {
                            label: 'Solicitudes Registradas',
                            backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            borderColor: 'rgb(99, 102, 241)',
                            borderWidth: 2,
                            borderRadius: 8,
                            borderSkipped: false,
                            data: formattedData.map(item => item["total solicitudes registradas"] || 0)
                        },
                        {
                            label: 'Beneficiarios Únicos',
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                            borderColor: 'rgb(16, 185, 129)',
                            borderWidth: 2,
                            borderRadius: 8,
                            borderSkipped: false,
                            data: formattedData.map(item => item["recien nacidos beneficiados"] || 0)
                        },
                        {
                            label: 'Litros Distribuidos',
                            backgroundColor: 'rgba(245, 158, 11, 0.8)',
                            borderColor: 'rgb(245, 158, 11)',
                            borderWidth: 2,
                            borderRadius: 8,
                            borderSkipped: false,
                            data: formattedData.map(item => parseFloat(item["leche distribuida litros"] || 0).toFixed(2))
                        }
                    ]
                });

                setChartOptions({
                    maintainAspectRatio: false,
                    aspectRatio: 0.6,
                    plugins: {
                        legend: {
                            labels: {
                                color: documentStyle.getPropertyValue('--text-color') || '#374151',
                                font: {
                                    size: 14,
                                    weight: '500'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.dataset.label === 'Litros Distribuidos') {
                                        label += parseFloat(context.parsed.y).toFixed(2) + ' L';
                                    } else {
                                        label += context.parsed.y;
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary') || '#6b7280',
                                font: {
                                    size: 12,
                                    weight: '500'
                                }
                            },
                            grid: {
                                display: false,
                                drawBorder: false
                            }
                        },
                        y: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary') || '#6b7280',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border') || 'rgba(0, 0, 0, 0.1)',
                                drawBorder: false
                            }
                        }
                    }
                });

                // Guardar datos del resumen
                setResumenData(data.resumen);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const MetricCard = ({ title, value, icon, color, subtitle }) => (
        <div className="col-12 md:col-4">
            <div className="card border-0 shadow-2 h-full">
                <div className="flex align-items-center justify-content-between mb-3">
                    <div className="flex align-items-center">
                        <div 
                            className="flex align-items-center justify-content-center border-circle mr-3"
                            style={{ 
                                width: '3rem', 
                                height: '3rem', 
                                backgroundColor: color + '20',
                                color: color 
                            }}
                        >
                            <i className={icon} style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <div>
                            <div className="text-500 font-medium mb-1">{title}</div>
                            <div className="text-2xl font-bold text-900">{value}</div>
                            {subtitle && <div className="text-sm text-500 mt-1">{subtitle}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <h2 className="text-2xl font-bold text-900 mb-4">Resumen Mensual de Solicitudes</h2>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="h-full">
                        <Skeleton height="6rem" />
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="h-full">
                        <Skeleton height="6rem" />
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="h-full">
                        <Skeleton height="6rem" />
                    </Card>
                </div>
                <div className="col-12">
                    <Card>
                        <Skeleton height="25rem" />
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            {/* Header */}
            <div className="col-12">
                <div className="flex align-items-center justify-content-between mb-4">
                    <h2 className="text-3xl font-bold text-900 m-0">Resumen Mensual de Solicitudes</h2>
                    <div className="flex align-items-center text-500">
                        <i className="pi pi-calendar mr-2"></i>
                        <span className="font-medium">Resumen General</span>
                    </div>
                </div>
            </div>

           

            {/* Gráfico */}
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <h3 className="text-xl font-bold text-900 m-0">Distribución Mensual</h3>
                        <div className="flex align-items-center text-500">
                            <i className="pi pi-chart-bar mr-2"></i>
                            <span className="font-medium">Análisis por Mes</span>
                        </div>
                    </div>
                    <div style={{ height: '400px' }}>
                        <Chart 
                            type="bar" 
                            data={chartData} 
                            options={chartOptions} 
                            style={{ height: '100%' }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResumenMensualSolicitudL;