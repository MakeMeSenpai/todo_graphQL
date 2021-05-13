const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
    type Todo {
        name: String!
        date: String!
        completed: Boolean!
        id: Int!
    }

	type Query {
		getAllTodos: [Todo!]!
        getTodo: Todo!
	}

    type Mutations {
        addTodo(name: String!, id: Int!): Todo!
    }`

const data = [
    { name: "first todo", date: new Date(), completed: false, id: 0 }
]

const resolvers = {
    Query: {
        getAllTodos: () => {
            return data
        },
        getTodo: () => {
            return data[0]
        },
        getCompletedTodos: () => {
            return data.filter(done => data.completed == true)
        }
    },
    Mutations: {
        addTodo: (name) => {
            const todo = { name, date: new Date(), completed: false, id: data.findIndex() + 1 }
            data.push(todo)
            return todo
        },
        completedTodo: (id) => {
            if (!data[id]) {
                throw new Error('No todo exists at ' + id);
            }
            data[id].completed = true
            return data[id]
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});