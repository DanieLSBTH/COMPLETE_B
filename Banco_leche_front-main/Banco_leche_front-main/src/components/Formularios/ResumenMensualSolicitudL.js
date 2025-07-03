import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ResumenMensualSolicitudL = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Fetch data from the API
        fetch('http://localhost:8080/api/solicitud_de_leches/resumen/por-mes/')
            .then(response => response.json())
            .then(data => {
                // Transform the data to fit Recharts structure
                const formattedData = data.asistencia.reduce((acc, curr) => {
                    const month = Object.keys(curr).find(key => key.includes('2024'));
                    if (month) {
                        const existing = acc.find(item => item.mes === month);
                        if (existing) {
                            existing[curr.tipo] = parseFloat(curr[month]);
                        } else {
                            acc.push({
                                mes: month,
                                [curr.tipo]: parseFloat(curr[month])
                            });
                        }
                    }
                    return acc;
                }, []);
                
                setChartData(formattedData);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="recien nacidos beneficiados" fill="#8884d8" />
                <Bar dataKey="leche distribuida litros" fill="#82ca9d" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ResumenMensualSolicitudL;
