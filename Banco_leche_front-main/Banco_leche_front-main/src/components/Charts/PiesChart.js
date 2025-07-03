import React, { useEffect, useState, useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import api from '../../services/api';

// Constantes para colores y opciones del gráfico
const CHART_COLORS = {
  DONACIONES: '--blue-500',
  DONADORAS: '--green-500',
  LITROS: '--yellow-500'
};

export default function ResumenPorMesBarChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para formatear el mes y servicio
    const formatMesServicio = (mes, servicioTipo) => `${mes} - ${servicioTipo}`;

    // Usamos useMemo para calcular los datos derivados solo cuando data cambia
    const { chartData, chartOptions, metricData } = useMemo(() => {
        if (!data.length) return { chartData: {}, chartOptions: {}, metricData: [] };
        
        const documentStyle = getComputedStyle(document.documentElement);
        
        // Calcular totales una sola vez
        const totalDonaciones = data.reduce((acc, item) => acc + item.totalDonaciones, 0);
        const totalDonadoras = data.reduce((acc, item) => acc + item.totalDonadoras, 0);
        const totalLitros = data.reduce((acc, item) => acc + item.totalLitros, 0);
        
        return {
            chartData: {
                labels: data.map(item => item.mes),
                datasets: [
                    {
                        label: 'Donaciones',
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.DONACIONES),
                        borderColor: documentStyle.getPropertyValue(CHART_COLORS.DONACIONES),
                        data: data.map(item => item.totalDonaciones)
                    },
                    {
                        label: 'Donadoras',
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.DONADORAS),
                        borderColor: documentStyle.getPropertyValue(CHART_COLORS.DONADORAS),
                        data: data.map(item => item.totalDonadoras)
                    },
                    {
                        label: 'Litros Distribuidos',
                        backgroundColor: documentStyle.getPropertyValue(CHART_COLORS.LITROS),
                        borderColor: documentStyle.getPropertyValue(CHART_COLORS.LITROS),
                        data: data.map(item => item.totalLitros)
                    }
                ]
            },
            chartOptions: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                aspectRatio: 0.8,
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
                            color: documentStyle.getPropertyValue('--text-color')
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: documentStyle.getPropertyValue('--text-color-secondary'),
                            font: {
                                weight: 500
                            }
                        },
                        grid: {
                            display: false,
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
                        }
                    }
                }
            },
            metricData: [
                { 
                    label: 'Total Donaciones', 
                    color: documentStyle.getPropertyValue(CHART_COLORS.DONACIONES), 
                    value: totalDonaciones, 
                    icon: 'pi pi-heart' 
                },
                { 
                    label: 'Total Donadoras', 
                    color: documentStyle.getPropertyValue(CHART_COLORS.DONADORAS), 
                    value: totalDonadoras, 
                    icon: 'pi pi-users' 
                },
                { 
                    label: 'Total Litros Distribuidos', 
                    color: documentStyle.getPropertyValue(CHART_COLORS.LITROS), 
                    value: totalLitros.toFixed(2), 
                    icon: 'pi pi-drop' 
                }
            ]
        };
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/donadora_detalle/resumen-por-mes/');
                
                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error('Formato de datos inválido');
                }
                
                const formattedData = response.data.map(item => ({
                    mes: formatMesServicio(item.mes, item.servicio_tipo),
                    totalDonaciones: parseInt(item.total_donaciones, 10) || 0,
                    totalDonadoras: parseInt(item.total_donadoras, 10) || 0,
                    totalLitros: parseFloat(item.total_litros) || 0
                }));
                
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
        return <div className="flex justify-content-center align-items-center p-4">Cargando datos...</div>;
    }

    if (error) {
        return <div className="p-4 surface-card border-round shadow-2 text-center text-danger">{error}</div>;
    }

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h3 className="text-center">Resumen de Donaciones por Mes</h3>
                    <div className="flex justify-content-center mb-4">
                        <MeterGroup values={metricData} />
                    </div>
                    <div style={{ height: '400px' }}>
                        <Chart type="bar" data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}