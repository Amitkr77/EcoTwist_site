"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm({
    defaultValues: {
      name: "",
      hsnCode: "",
      description: "",
      bestUse: "",
      usage: "",
      ingredients: "",
      benefits: [{ value: "" }],
      categories: [{ value: "" }],
      tags: [{ value: "" }],
      images: [{ url: "", alt: "", isPrimary: false, position: 1 }],
      options: [{ name: "", values: [{ value: "" }] }],
      variants: [
        { sku: "", optionValues: {}, price: 0, inventory: { quantity: 0 } },
      ],
      faqs: [{ question: "", answer: "" }],
      seo: { metaTitle: "", metaDescription: "" },
      subscriptionOffer: {
        enabled: false,
        firstOrderDiscountPct: 0,
        recurringDiscountPct: 0,
        interval: { unit: "month", count: 1 },
        shippingInsured: false,
        cancelAnytime: true,
      },
    },
  });

  // Field arrays for top-level fields
  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({ control, name: "benefits" });
  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({ control, name: "categories" });
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: "tags" });
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: "images" });
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: "options" });
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });
  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({ control, name: "faqs" });

  // Initialize option value field arrays for each option (up to maxOptions)
  const maxOptions = 1;
  const optionValueFields = Array.from({ length: maxOptions }, (_, index) =>
    useFieldArray({ control, name: `options.${index}.values` })
  );

  // Watch options and variants
  const options = watch("options");
  const variants = watch("variants");

  // Debounced appendOption to prevent multiple triggers
  const debouncedAppendOption = useCallback(() => {
    appendOption({ name: "", values: [{ value: "" }] });
    console.log("Appended option, current options:", options.length + 1);
  }, [appendOption, options]);

  // Sync optionValues when options or their values change
  useEffect(() => {
    variants.forEach((variant, vIndex) => {
      const updatedOptionValues = {};
      options.forEach((opt, oIndex) => {
        if (opt.name) {
          const currentValue = variant.optionValues[opt.name] || "";
          const validValues = (opt.values || [])
            .map((v) => v.value)
            .filter((v) => v);
          updatedOptionValues[opt.name] = validValues.includes(currentValue)
            ? currentValue
            : validValues[0] || "";
        }
      });
      setValue(`variants.${vIndex}.optionValues`, updatedOptionValues);
    });
  }, [options, variants, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Validate unique SKUs
      const skus = data.variants.map((v) => v.sku);
      if (new Set(skus).size !== skus.length) {
        alert("Error: Duplicate SKUs detected.");
        return;
      }

      // Validate unique variant option combinations
      const variantCombinations = data.variants.map((v) =>
        JSON.stringify(v.optionValues)
      );
      if (new Set(variantCombinations).size !== variantCombinations.length) {
        alert("Error: Duplicate variant option combinations detected.");
        return;
      }

      // Validate at least one primary image
      const hasPrimaryImage = data.images.some((img) => img.isPrimary);
      if (!hasPrimaryImage && data.images.length > 0) {
        alert("Error: At least one image must be marked as primary.");
        return;
      }

      // Transform data to match backend schema
      const formattedData = {
        ...data,
        benefits: data.benefits.map((b) => b.value).filter((v) => v),
        categories: data.categories.map((c) => c.value).filter((v) => v),
        tags: data.tags.map((t) => t.value).filter((v) => v),
        images: data.images.map((img, index) => ({
          ...img,
          position: index + 1,
        })),
        options: data.options
          .map((opt) => ({
            name: opt.name,
            values: opt.values.map((v) => v.value).filter((v) => v),
          }))
          .filter((opt) => opt.name && opt.values.length > 0),
        variants: data.variants.map((v) => ({
          ...v,
          optionValues: Object.fromEntries(
            Object.entries(v.optionValues).filter(([_, value]) => value)
          ),
        })),
      };

      // Validate required arrays
      if (formattedData.benefits.length === 0) {
        alert("Error: At least one benefit is required.");
        return;
      }
      if (formattedData.categories.length === 0) {
        alert("Error: At least one category is required.");
        return;
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        alert("Product added successfully!");
        reset();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert("Error: Failed to add product.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Collect all errors for summary
  const allErrors = Object.values(errors).flatMap((err) =>
    typeof err === "object"
      ? Object.values(err).flatMap((e) => (e.message ? [e.message] : []))
      : []
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-4 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold">Add New Product</h2>

      {/* Error Summary */}
      {isSubmitted && allErrors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">
            Please fix the following errors:
          </strong>
          <ul className="list-disc pl-5">
            {allErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Product name is required" })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="hsnCode">
              HSN Code (4-8 digits) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="hsnCode"
              {...register("hsnCode", {
                required: "HSN Code is required",
                pattern: {
                  value: /^[0-9]{4,8}$/,
                  message: "HSN Code must be 4-8 digits",
                },
              })}
              className={errors.hsnCode ? "border-red-500" : ""}
            />
            {errors.hsnCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.hsnCode.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div>
            <Label htmlFor="bestUse">Best Use</Label>
            <Textarea id="bestUse" {...register("bestUse")} />
          </div>
          <div>
            <Label htmlFor="usage">Usage Instructions</Label>
            <Textarea id="usage" {...register("usage")} />
          </div>
          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea id="ingredients" {...register("ingredients")} />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        {benefitFields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2 mt-2">
            <Input
              {...register(`benefits.${index}.value`, {
                required: "Benefit is required",
              })}
              placeholder="Enter benefit"
              className={
                errors.benefits?.[index]?.value ? "border-red-500" : ""
              }
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to remove this benefit?"
                  )
                ) {
                  removeBenefit(index);
                }
              }}
            >
              Remove
            </Button>
            {errors.benefits?.[index]?.value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.benefits[index].value.message}
              </p>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => appendBenefit({ value: "" })}
          className="mt-2"
        >
          Add Benefit
        </Button>
      </div>

      {/* Categories */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        {categoryFields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2 mt-2">
            <Input
              {...register(`categories.${index}.value`, {
                required: "Category is required",
              })}
              placeholder="Enter category"
              className={
                errors.categories?.[index]?.value ? "border-red-500" : ""
              }
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to remove this category?"
                  )
                ) {
                  removeCategory(index);
                }
              }}
            >
              Remove
            </Button>
            {errors.categories?.[index]?.value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categories[index].value.message}
              </p>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => appendCategory({ value: "" })}
          className="mt-2"
        >
          Add Category
        </Button>
      </div>

      {/* Tags */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Tags</h3>
        {tagFields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2 mt-2">
            <Input
              {...register(`tags.${index}.value`, {
                required: "Tag is required",
              })}
              placeholder="Enter tag"
              className={errors.tags?.[index]?.value ? "border-red-500" : ""}
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to remove this tag?")
                ) {
                  removeTag(index);
                }
              }}
            >
              Remove
            </Button>
            {errors.tags?.[index]?.value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tags[index].value.message}
              </p>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => appendTag({ value: "" })}
          className="mt-2"
        >
          Add Tag
        </Button>
      </div>

      {/* Images */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Images</h3>
        {imageFields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-2 mt-2 border p-4 rounded bg-white"
          >
            <div>
              <Label htmlFor={`images.${index}.url`}>
                Image URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`images.${index}.url`}
                {...register(`images.${index}.url`, {
                  required: "Image URL is required",
                })}
                placeholder="Image URL"
                className={errors.images?.[index]?.url ? "border-red-500" : ""}
              />
              {errors.images?.[index]?.url && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.images[index].url.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`images.${index}.alt`}>Alt Text</Label>
              <Input
                id={`images.${index}.alt`}
                {...register(`images.${index}.alt`)}
                placeholder="Alt text"
              />
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(`images.${index}.isPrimary`)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>Is Primary Image</span>
            </label>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to remove this image?")
                ) {
                  removeImage(index);
                }
              }}
            >
              Remove Image
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            appendImage({
              url: "",
              alt: "",
              isPrimary: false,
              position: imageFields.length + 1,
            })
          }
          className="mt-2"
        >
          Add Image
        </Button>
      </div>

      {/* Options */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Options</h3>
        {optionFields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-2 mt-2 border p-4 rounded bg-white"
          >
            <div>
              <Label htmlFor={`options.${index}.name`}>
                Option Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`options.${index}.name`}
                {...register(`options.${index}.name`, {
                  required: "Option name is required",
                })}
                placeholder="Option Name (e.g., Size)"
                className={
                  errors.options?.[index]?.name ? "border-red-500" : ""
                }
              />
              {errors.options?.[index]?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.options[index].name.message}
                </p>
              )}
            </div>
            <div>
              <Label>
                Option Values <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {optionValueFields[index]?.fields.map((vField, vIndex) => (
                  <div key={vField.id} className="flex items-center space-x-2">
                    <Input
                      {...register(`options.${index}.values.${vIndex}.value`, {
                        required: "Option value is required",
                      })}
                      placeholder="Enter option value (e.g., Small)"
                      className={
                        errors.options?.[index]?.values?.[vIndex]?.value
                          ? "border-red-500"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to remove this option value?"
                          )
                        ) {
                          optionValueFields[index].remove(vIndex);
                        }
                      }}
                    >
                      Remove
                    </Button>
                    {errors.options?.[index]?.values?.[vIndex]?.value && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.options[index].values[vIndex].value.message}
                      </p>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => optionValueFields[index].append({ value: "" })}
                  className="mt-2"
                >
                  Add Option Value
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to remove this option?")
                ) {
                  removeOption(index);
                }
              }}
            >
              Remove Option
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={debouncedAppendOption}
          className="mt-2"
        >
          Add Option
        </Button>
      </div>

      {/* Variants */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Variants</h3>
        {variantFields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-2 mt-2 border p-4 rounded bg-white"
          >
            <div>
              <Label htmlFor={`variants.${index}.sku`}>
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`variants.${index}.sku`}
                {...register(`variants.${index}.sku`, {
                  required: "SKU is required",
                })}
                placeholder="SKU (e.g., LBOX-SS-SML)"
                className={
                  errors.variants?.[index]?.sku ? "border-red-500" : ""
                }
              />
              {errors.variants?.[index]?.sku && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.variants[index].sku.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`variants.${index}.price`}>
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`variants.${index}.price`}
                type="number"
                step="0.01"
                {...register(`variants.${index}.price`, {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Price cannot be negative" },
                })}
                placeholder="Price"
                className={
                  errors.variants?.[index]?.price ? "border-red-500" : ""
                }
              />
              {errors.variants?.[index]?.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.variants[index].price.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`variants.${index}.inventory.quantity`}>
                Inventory Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`variants.${index}.inventory.quantity`}
                type="number"
                {...register(`variants.${index}.inventory.quantity`, {
                  required: "Quantity is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
                placeholder="Inventory Quantity"
                className={
                  errors.variants?.[index]?.inventory?.quantity
                    ? "border-red-500"
                    : ""
                }
              />
              {errors.variants?.[index]?.inventory?.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.variants[index].inventory.quantity.message}
                </p>
              )}
            </div>
            <div>
              <Label>
                Option Values <span className="text-red-500">*</span>
              </Label>
              {options.map((opt, oIndex) => (
                <div key={oIndex} className="mt-2">
                  <Label htmlFor={`variants.${index}.optionValues.${opt.name}`}>
                    {opt.name || `Option ${oIndex + 1}`}
                  </Label>
                  <select
                    id={`variants.${index}.optionValues.${opt.name}`}
                    {...register(`variants.${index}.optionValues.${opt.name}`, {
                      required: `${opt.name || "Option"} value is required`,
                      validate: (value) =>
                        (opt.values || []).some((v) => v.value === value) ||
                        "Invalid option value",
                    })}
                    className={`w-full border rounded p-2 ${
                      errors.variants?.[index]?.optionValues?.[opt.name]
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <option value="">Select {opt.name || "option"}</option>
                    {(opt.values || [])
                      .filter((v) => v.value)
                      .map((v, vIndex) => (
                        <option key={vIndex} value={v.value}>
                          {v.value}
                        </option>
                      ))}
                  </select>
                  {errors.variants?.[index]?.optionValues?.[opt.name] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.variants[index].optionValues[opt.name].message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to remove this variant?"
                  )
                ) {
                  removeVariant(index);
                }
              }}
            >
              Remove Variant
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const optionValues = {};
            options.forEach((opt) => {
              const validValues = (opt.values || [])
                .map((v) => v.value)
                .filter((v) => v);
              if (opt.name && validValues.length > 0) {
                optionValues[opt.name] = validValues[0];
              }
            });
            appendVariant({
              sku: "",
              optionValues,
              price: 0,
              inventory: { quantity: 0 },
            });
          }}
          className="mt-2"
        >
          Add Variant
        </Button>
      </div>

      {/* FAQs */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">FAQs</h3>
        {faqFields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-2 mt-2 border p-4 rounded bg-white"
          >
            <div>
              <Label htmlFor={`faqs.${index}.question`}>
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`faqs.${index}.question`}
                {...register(`faqs.${index}.question`, {
                  required: "Question is required",
                })}
                placeholder="Enter question"
                className={
                  errors.faqs?.[index]?.question ? "border-red-500" : ""
                }
              />
              {errors.faqs?.[index]?.question && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.faqs[index].question.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`faqs.${index}.answer`}>
                Answer <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`faqs.${index}.answer`}
                {...register(`faqs.${index}.answer`, {
                  required: "Answer is required",
                })}
                placeholder="Enter answer"
                className={errors.faqs?.[index]?.answer ? "border-red-500" : ""}
              />
              {errors.faqs?.[index]?.answer && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.faqs[index].answer.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to remove this FAQ?")
                ) {
                  removeFaq(index);
                }
              }}
            >
              Remove FAQ
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => appendFaq({ question: "", answer: "" })}
          className="mt-2"
        >
          Add FAQ
        </Button>
      </div>

      {/* SEO */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">SEO</h3>
        <div className="space-y-2">
          <div>
            <Label htmlFor="seo.metaTitle">Meta Title</Label>
            <Input
              id="seo.metaTitle"
              {...register("seo.metaTitle")}
              placeholder="Meta Title"
            />
          </div>
          <div>
            <Label htmlFor="seo.metaDescription">Meta Description</Label>
            <Textarea
              id="seo.metaDescription"
              {...register("seo.metaDescription")}
              placeholder="Meta Description"
            />
          </div>
        </div>
      </div>

      {/* Subscription Offer */}
      <div className="border p-4 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Subscription Offer</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("subscriptionOffer.enabled")}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>Enable Subscription Offer</span>
          </label>
          <div>
            <Label htmlFor="subscriptionOffer.firstOrderDiscountPct">
              First Order Discount (%)
            </Label>
            <Input
              id="subscriptionOffer.firstOrderDiscountPct"
              type="number"
              step="0.01"
              {...register("subscriptionOffer.firstOrderDiscountPct", {
                valueAsNumber: true,
                min: { value: 0, message: "Discount cannot be negative" },
                max: { value: 100, message: "Discount cannot exceed 100%" },
              })}
              placeholder="First Order Discount (%)"
              className={
                errors.subscriptionOffer?.firstOrderDiscountPct
                  ? "border-red-500"
                  : ""
              }
            />
            {errors.subscriptionOffer?.firstOrderDiscountPct && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subscriptionOffer.firstOrderDiscountPct.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="subscriptionOffer.recurringDiscountPct">
              Recurring Discount (%)
            </Label>
            <Input
              id="subscriptionOffer.recurringDiscountPct"
              type="number"
              step="0.01"
              {...register("subscriptionOffer.recurringDiscountPct", {
                valueAsNumber: true,
                min: { value: 0, message: "Discount cannot be negative" },
                max: { value: 100, message: "Discount cannot exceed 100%" },
              })}
              placeholder="Recurring Discount (%)"
              className={
                errors.subscriptionOffer?.recurringDiscountPct
                  ? "border-red-500"
                  : ""
              }
            />
            {errors.subscriptionOffer?.recurringDiscountPct && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subscriptionOffer.recurringDiscountPct.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="subscriptionOffer.interval.unit">
              Interval Unit
            </Label>
            <select
              id="subscriptionOffer.interval.unit"
              {...register("subscriptionOffer.interval.unit")}
              className="w-full border rounded p-2"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div>
            <Label htmlFor="subscriptionOffer.interval.count">
              Interval Count <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subscriptionOffer.interval.count"
              type="number"
              {...register("subscriptionOffer.interval.count", {
                required: "Interval count is required",
                valueAsNumber: true,
                min: { value: 1, message: "Interval count must be at least 1" },
              })}
              placeholder="Interval Count"
              className={
                errors.subscriptionOffer?.interval?.count
                  ? "border-red-500"
                  : ""
              }
            />
            {errors.subscriptionOffer?.interval?.count && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subscriptionOffer.interval.count.message}
              </p>
            )}
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("subscriptionOffer.shippingInsured")}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>Shipping Insured</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("subscriptionOffer.cancelAnytime")}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>Cancel Anytime</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Add Product"}
      </Button>
    </form>
  );
}
