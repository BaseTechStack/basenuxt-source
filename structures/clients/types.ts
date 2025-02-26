// Client

/*{
  "company": "string",
  "email": "string",
  "name": "string",
  "phone": "string"
}*/

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  createdAt: string
  updatedAt: string
}
