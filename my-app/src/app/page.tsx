"use client";
import { useEffect, useState } from "react";

export default function Home() {
  type Item = {
    id: number,
    name: string,
    phone: number
  }

  const [data, setData] = useState<Item[] | null>(null)
  useEffect(() => {
    
    async function loadData() {
      const data = await fetch('http://localhost:3022/')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Processa a resposta como JSON
      })
      .then((data) => {
        setData(data)
        console.log(data); // Exibe os dados da API
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
      });
      console.log('aquiiiii')
      console.log(data, 'data')
    }
    loadData()
  }, [])

  return (
    <div className="bg-white text-center">
      {data?.map((item) => (
        <div key={item.id}>
          <h1 className="text-neutral-950">{item.name}</h1>
          <p className="text-neutral-950">{item.phone}</p>
        </div>
      ))}
    </div>
  );
}
