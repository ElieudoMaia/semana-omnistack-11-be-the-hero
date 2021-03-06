const connection = require('../database/connection.js');

module.exports = {

    async index(request, response) {

        const { page = 1 } = request.query;

        const [count] = await connection('incidents').count();

        response.header('X-Total-Count', count['count(*)']);

        const incidents = await connection('incidents').join('ongs', 'ongs.id', '=', 'incidents.ong_id')
        .limit(5).offset((page - 1) * 5)
        .select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf']);

        return response.json(incidents);

    },

    async store(request, response) {
        
        const { title, description, value } = request.body;
        const ong_id = request.headers.authorization;
        
        //const result = await connection('incidents').insert({ // retorna um array com uma única posição
        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id
        });

        return response.json({ id });
    },

    async delete(request, response){
        const { id } = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents').where('id', id).select('ong_id').first();

        if(ong_id != incident.ong_id) {
            return response.status(401).json({ error: 'Operação não permitida'});
        }

        await connection('incidents').where('id', id).delete();

        return response.status(204).send(); // 204 response sem conteudo - send envia sem corpo

    }

}