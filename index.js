const { ApolloServer, gql, PubSub } = require('apollo-server');
const pubsub = new PubSub();

const typeDefs = gql`
    type Todo {
        name: String!
        date: String!
        completed: Boolean!
        id: Int!
    }

    type Query {
        todos(completed: Boolean): [Todo!]!
        todo(id: Int!): Todo!
    }

    type Mutation {
        addTodo(name: String!): Todo!
        completeTodo(id: Int!): Todo!
    }

    type Subscription {
        newTodo: Todo!
        completedTodo: Todo!
    }`

const allTodos = []
const completedTodos = []

const resolvers = {
    Query: {
        todos: (_, {completed}) => {
            if (completed == true) {
                return completedTodos
            } else if (completed == false) {
                let incomplete = []
                allTodos.forEach(todo => {
                    if (!todo.completed) {
                        incomplete.push(todo)
                    }
                })
                return incomplete
            }

            return allTodos
        }, 
        todo: (_, {id}) => {
            return allTodos[id]
        }
    },
    Mutation: {
        addTodo: (_, {name, priority = 'low'}) => {
            const todo = {name: name, completed: false, id: todosArr.length, date: new Date(), priority: priority}
            todosArr.push(todo)
            pubsub.publish('NEW_TODO', { newTodo: todo }) // Publish!
            return todo
        },
        completeTodo: (_, {id}) => {
            todosArr[id].completed = true
            const todo = todosArr[id]
            completedTodos.push(todo)
            pubsub.publish('COMPLETED_TODO', { completedTodo: todo }) // Publish!
            return todo
        },
    },
    Subscription: {
        newTodo: {
            subscribe: () => pubsub.asyncIterator('NEW_TODO')
        },
        completedTodo: {
            subscribe: () => pubsub.asyncIterator('COMPLETED_TODO')
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});