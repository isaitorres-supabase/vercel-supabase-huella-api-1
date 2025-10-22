// --- Archivo: vercel-huella-api/api/residente.ts ---

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase usando Variables de Entorno de Vercel
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Usar la clave de servicio
);

// Función Serverless (Este es el punto de entrada para Vercel)
export default async (req: VercelRequest, res: VercelResponse) => {
    
    // Solo permitimos el método GET
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed'); 
    }

    // 1. Obtener el ID del residente desde el query parameter (e.g., /api/residente?id=1)
    const residente_id_str = req.query.id; 
    const residente_id = residente_id_str ? parseInt(residente_id_str as string) : null;

    if (!residente_id) {
        return res.status(400).json({ error: 'Falta el ID del residente.' });
    }
    
    // 2. Ejecutar la consulta a Supabase 
    try {
        const { data, error } = await supabase
            .from('Residentes') // Nombre de la tabla
            .select('id, Huella_Dactilar') 
            .eq('id', residente_id) 
            .single(); 

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Residente no encontrado' });
            }
            throw new Error(error.message); 
        }

        if (!data) {
            return res.status(404).json({ error: 'Residente no encontrado' });
        }

        // 3. Devolver la respuesta JSON (ej: {"id": 1, "Huella_Dactilar": "..."})
        return res.status(200).json(data);

    } catch (e) {
        console.error('Error al procesar la solicitud:', e);
        return res.status(500).json({ error: `Error interno del servidor: ${e.message}` });
    }
};