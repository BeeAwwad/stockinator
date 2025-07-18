"use client"

import { useForm, Controller } from "react-hook-form"
import type { ProductType, Transaction } from "@/lib/types"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionSchema } from "@/lib/schemas"
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "./ui/select"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { useState } from "react"

type TransactionFormProps = z.infer<typeof transactionSchema>

export default function TransactionForm({
  products,
  onSubmit,
}: {
  products: ProductType[]
  onSubmit: (data: Transaction) => void
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TransactionFormProps>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      uid: "",
      quantity: 0,
      total: 0,
      createdBy: "",
      createdAt: new Date(),
    },
  })

  const [price, setPrice] = useState<string>("")

  const handleFormSubmit = async (data: TransactionFormProps) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit(handleFormSubmit, (errors) => {
          console.log("🧨 FORM ERRORS:", errors)
        })}
        className="space-y-3"
      >
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <Controller
            name="uid"
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              const selectedProduct = products.find(
                (product) => product.uid === getValues().uid
              )

              return (
                <Select
                  onValueChange={(value) => {
                    setPrice(
                      products
                        .find((product) => product.uid === value)
                        ?.price.toString() ?? ""
                    )
                    field.onChange(value)
                  }}
                  value={getValues().uid}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {selectedProduct
                        ? selectedProduct.name
                        : "Select Product"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.uid} value={product.uid}>
                        {product.name} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }}
          />
          {errors.uid && (
            <p className="text-sm text-rose-500">Product required</p>
          )}

          <Input
            type="number"
            placeholder="Quantity"
            {...register("quantity", { valueAsNumber: true, required: true })}
          />
          {errors.quantity && (
            <p className="text-sm text-rose-500">Quantity required</p>
          )}
          {price !== "" ? (
            <div className="text-sm border px-3 py-1.5 rounded-md shadow-xs">
              {price}
            </div>
          ) : (
            ""
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full mt-2.5">
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
