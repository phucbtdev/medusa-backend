import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createCustomerAccountWorkflow } from "@medusajs/medusa/core-flows"

interface ClerkLoginBody {
    email: string
    name: string
    auth_id: string
}
  
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email, name, auth_id } = req.body as ClerkLoginBody

  if (!email || !auth_id) {
    return res.status(400).json({ message: "Missing email or auth_id" })
  }

  try {
    const customerService = req.scope.resolve("customerModule") as {
      retrieveByEmail: (email: string) => Promise<any>
    }

    // Check nếu đã tồn tại customer
    const existingCustomer = await customerService
      .retrieveByEmail(email)
      .catch(() => null)

    if (existingCustomer) {
      return res.status(200).json({
        customer: existingCustomer,
        message: "Customer already exists",
      })
    }
    const { result } = await createCustomerAccountWorkflow(req.scope).run({
      input: {
        authIdentityId: auth_id,
        customerData: {
          email,
          first_name: name,
        }
      }
    })

    return res.status(200).json({
      customer: result,
      message: "Customer created or linked successfully",
    })
  } catch (e) {
    return res.status(500).json({ message: "Internal server error", error: e })
  }
}
