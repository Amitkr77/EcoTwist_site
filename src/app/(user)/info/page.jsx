"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Eye, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const initialFormData = {
  name: "",
  brand: "",
  description: "",
  usage: "",
  benefits: [""],
  ingredients: "",
  bestUse: "",
  categories: [""],
  tags: [""],
  images: [{ url: "", alt: "", isPrimary: true, position: 1 }],
  options: [{ name: "", values: [""] }],
  variants: [
    {
      sku: "",
      optionValues: {},
      price: "",
      inventory: { quantity: "" },
      weight: { unit: "g" },
      dimensions: { unit: "cm" },
      imageUrls: [],
      isActive: true,
    },
  ],
  subscriptionOffer: {
    enabled: false,
    firstOrderDiscountPct: 0,
    recurringDiscountPct: 0,
    interval: { unit: "day", count: 30 },
    shippingInsured: false,
    cancelAnytime: false,
  },
  seo: { metaTitle: "", metaDescription: "" },
  isActive: true,
  isFeatured: false,
  faqs: [{ question: "", answer: "" }],
};

export default function ProductPage({ isOpen = true, onClose, onAddProduct }) {
  const [formData, setFormData] = useState(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("productFormData")
        : null;
    return saved ? JSON.parse(saved) : initialFormData;
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({ variants: true, subscription: true, seo: true, faqs: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("productFormData", JSON.stringify(formData));
    }
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.variants.some((v) => !v.sku.trim())) newErrors.variants = "All variants must have a SKU";
    if (formData.variants.some((v) => !v.price || v.price <= 0)) newErrors.price = "All variants must have a valid price";
    if (formData.variants.some((v) => !v.inventory.quantity || v.inventory.quantity < 0))
      newErrors.inventory = "All variants must have a valid inventory quantity";
    if (formData.images.some((img) => img.url && !img.alt.trim()))
      newErrors.imageAlt = "All uploaded images must have alt text";
    if (formData.seo.metaTitle && formData.seo.metaTitle.length > 60)
      newErrors.metaTitle = "SEO title should be 60 characters or less";
    if (formData.seo.metaDescription && formData.seo.metaDescription.length > 160)
      newErrors.metaDescription = "SEO description should be 160 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e, field, index = null, subField = null) => {
    const newFormData = { ...formData };
    if (index !== null && subField) {
      newFormData[field][index][subField] = e.target.value;
    } else if (index !== null) {
      newFormData[field][index] = e.target.value;
    } else {
      newFormData[field] = e.target.value;
    }
    setFormData(newFormData);
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors((prev) => ({ ...prev, imageSize: "Image size must be under 5MB" }));
        return;
      }
      const url = URL.createObjectURL(file);
      const newFormData = { ...formData };
      newFormData.images[index].url = url;
      setFormData(newFormData);
      setImagePreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[index] = url;
        return newPreviews;
      });
    }
  };

  const removeImage = (index) => {
    const newFormData = { ...formData };
    newFormData.images.splice(index, 1);
    newFormData.images.forEach((img, i) => (img.position = i + 1));
    setFormData(newFormData);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageDragStart = (e, index) => {
    e.dataTransfer.setData("imageIndex", index);
  };

  const handleImageDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData("imageIndex");
    if (sourceIndex !== targetIndex) {
      const newImages = [...formData.images];
      const newPreviews = [...imagePreviews];
      const [movedImage] = newImages.splice(sourceIndex, 1);
      const [movedPreview] = newPreviews.splice(sourceIndex, 1);
      newImages.splice(targetIndex, 0, movedImage);
      newPreviews.splice(targetIndex, 0, movedPreview);
      newImages.forEach((img, i) => (img.position = i + 1));
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newPreviews);
    }
  };

  const addField = (field) => {
    const newFormData = { ...formData };
    if (field === "benefits") newFormData.benefits.push("");
    if (field === "categories") newFormData.categories.push("");
    if (field === "tags") newFormData.tags.push("");
    if (field === "images")
      newFormData.images.push({
        url: "",
        alt: "",
        isPrimary: false,
        position: newFormData.images.length + 1,
      });
    if (field === "options")
      newFormData.options.push({ name: "", values: [""] });
    if (field === "variants")
      newFormData.variants.push({
        sku: "",
        optionValues: {},
        price: "",
        inventory: { quantity: "" },
        weight: { unit: "g" },
        dimensions: { unit: "cm" },
        imageUrls: [],
        isActive: true,
      });
    if (field === "faqs") newFormData.faqs.push({ question: "", answer: "" });
    setFormData(newFormData);
  };

  const removeField = (field, index) => {
    const newFormData = { ...formData };
    newFormData[field].splice(index, 1);
    setFormData(newFormData);
  };

  const addOptionValue = (optionIndex) => {
    const newFormData = { ...formData };
    newFormData.options[optionIndex].values.push("");
    setFormData(newFormData);
  };

  const removeOptionValue = (optionIndex, valueIndex) => {
    const newFormData = { ...formData };
    newFormData.options[optionIndex].values.splice(valueIndex, 1);
    setFormData(newFormData);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      if (onAddProduct) onAddProduct(formData);
      if (onClose) onClose();
      setFormData(initialFormData);
      setImagePreviews([]);
      if (typeof window !== "undefined") localStorage.removeItem("productFormData");
    } catch (error) {
      setErrors({ submit: "Failed to submit product. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreview = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Product Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-bold">{formData.name || "Product Name"}</h3>
        <p className="text-gray-600">{formData.brand || "Brand"}</p>
        <p className="mt-4 whitespace-pre-wrap">{formData.description}</p>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <Image
                key={index}
                src={preview}
                alt={formData.images[index].alt || "Product image"}
                width={150}
                height={150}
                className="rounded object-cover"
              />
            ))}
          </div>
        )}
        <div className="mt-4">
          <h4 className="font-semibold">Variants</h4>
          {formData.variants.map((variant, index) => (
            <p key={index}>
              {variant.sku}: ₹{variant.price} ({variant.inventory.quantity} in stock)
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Add New Product</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPreviewMode(!previewMode)}
              aria-label={previewMode ? "Edit Form" : "Preview Product"}
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {Object.values(errors)[0]}
              </AlertDescription>
            </Alert>
          )}
          {isSubmitting && <Progress value={33} className="mb-4" />}
          
          <Tabs defaultValue="edit" value={previewMode ? "preview" : "edit"} onValueChange={(value) => setPreviewMode(value === "preview")}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Product Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    placeholder="Enter product name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Brand</Label>
                  <Input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange(e, "brand")}
                    placeholder="Enter brand name"
                    className={errors.brand ? "border-red-500" : ""}
                  />
                  {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange(e, "description")}
                    placeholder="Enter product description"
                    className={`w-full border rounded p-2 h-32 resize-y ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Usage Instructions</Label>
                  <Input
                    type="text"
                    value={formData.usage}
                    onChange={(e) => handleInputChange(e, "usage")}
                    placeholder="Enter usage instructions"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Benefits</Label>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleInputChange(e, "benefits", index)}
                        placeholder="Enter benefit"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeField("benefits", index)}
                        disabled={formData.benefits.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField("benefits")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Benefit
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium">Ingredients</Label>
                  <Input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange(e, "ingredients")}
                    placeholder="Enter ingredients (comma-separated)"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Best Use</Label>
                  <Input
                    type="text"
                    value={formData.bestUse}
                    onChange={(e) => handleInputChange(e, "bestUse")}
                    placeholder="Enter best use case"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Categories</Label>
                  {formData.categories.map((category, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={category}
                        onChange={(e) => handleInputChange(e, "categories", index)}
                        placeholder="Enter category"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeField("categories", index)}
                        disabled={formData.categories.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField("categories")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={tag}
                        onChange={(e) => handleInputChange(e, "tags", index)}
                        placeholder="Enter tag"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeField("tags", index)}
                        disabled={formData.tags.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField("tags")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Tag
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium">Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((image, index) => (
                      <Card
                        key={index}
                        className="p-4"
                        draggable
                        onDragStart={(e) => handleImageDragStart(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleImageDrop(e, index)}
                      >
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="mb-2"
                        />
                        <Input
                          type="text"
                          placeholder="Alt text"
                          value={image.alt}
                          onChange={(e) => handleInputChange(e, "images", index, "alt")}
                          className="mb-2"
                        />
                        <div className="flex items-center mb-2">
                          <Checkbox
                            checked={image.isPrimary}
                            onCheckedChange={(checked) => {
                              const newFormData = { ...formData };
                              newFormData.images.forEach(
                                (img, i) => (img.isPrimary = i === index ? checked : false)
                              );
                              setFormData(newFormData);
                            }}
                          />
                          <Label className="text-sm ml-2">Primary Image</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeImage(index)}
                          disabled={formData.images.length === 1}
                          className="mb-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {imagePreviews[index] && (
                          <Image
                            src={imagePreviews[index]}
                            alt="Preview"
                            width={150}
                            height={150}
                            className="rounded object-cover"
                          />
                        )}
                      </Card>
                    ))}
                  </div>
                  {errors.imageSize && <p className="text-red-500 text-sm mt-1">{errors.imageSize}</p>}
                  {errors.imageAlt && <p className="text-red-500 text-sm mt-1">{errors.imageAlt}</p>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField("images")}
                    className="text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Image
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium">Options</Label>
                  {formData.options.map((option, optionIndex) => (
                    <Card key={optionIndex} className="p-4 mb-2">
                      <div className="flex gap-2 mb-2">
                        <Input
                          type="text"
                          placeholder="Option Name (e.g., Color)"
                          value={option.name}
                          onChange={(e) => handleInputChange(e, "options", optionIndex, "name")}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeField("options", optionIndex)}
                          disabled={formData.options.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {option.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex gap-2 mb-2">
                          <Input
                            type="text"
                            placeholder="Option Value"
                            value={value}
                            onChange={(e) => {
                              const newFormData = { ...formData };
                              newFormData.options[optionIndex].values[valueIndex] = e.target.value;
                              setFormData(newFormData);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeOptionValue(optionIndex, valueIndex)}
                            disabled={option.values.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOptionValue(optionIndex)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Option Value
                      </Button>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField("options")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Variants</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("variants")}
                    >
                      {expandedSections.variants ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </CardHeader>
                  {expandedSections.variants && (
                    <CardContent>
                      {formData.variants.map((variant, index) => (
                        <Card key={index} className="p-4 mb-2">
                          <div className="flex gap-2 mb-2">
                            <Input
                              type="text"
                              placeholder="SKU"
                              value={variant.sku}
                              onChange={(e) => handleInputChange(e, "variants", index, "sku")}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeField("variants", index)}
                              disabled={formData.variants.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            type="number"
                            placeholder="Price (INR)"
                            value={variant.price}
                            onChange={(e) => handleInputChange(e, "variants", index, "price")}
                            step="0.01"
                            className="mb-2"
                          />
                          <Input
                            type="number"
                            placeholder="Inventory Quantity"
                            value={variant.inventory.quantity}
                            onChange={(e) => {
                              const newFormData = { ...formData };
                              newFormData.variants[index].inventory.quantity = e.target.value;
                              setFormData(newFormData);
                            }}
                            className="mb-2"
                          />
                          {formData.options.map((option, optIndex) => (
                            <select
                              key={optIndex}
                              className="w-full p-2 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500"
                              value={variant.optionValues[option.name] || ""}
                              onChange={(e) => {
                                const newFormData = { ...formData };
                                newFormData.variants[index].optionValues[option.name] = e.target.value;
                                setFormData(newFormData);
                              }}
                            >
                              <option value="">Select {option.name}</option>
                              {option.values.map((value, valIndex) => (
                                <option key={valIndex} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          ))}
                        </Card>
                      ))}
                      {errors.variants && <p className="text-red-500 text-sm">{errors.variants}</p>}
                      {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                      {errors.inventory && <p className="text-red-500 text-sm">{errors.inventory}</p>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addField("variants")}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Variant
                      </Button>
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">FAQs</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("faqs")}
                    >
                      {expandedSections.faqs ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </CardHeader>
                  {expandedSections.faqs && (
                    <CardContent>
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            type="text"
                            placeholder="Question"
                            value={faq.question}
                            onChange={(e) => handleInputChange(e, "faqs", index, "question")}
                            className="flex-1"
                          />
                          <Input
                            type="text"
                            placeholder="Answer"
                            value={faq.answer}
                            onChange={(e) => handleInputChange(e, "faqs", index, "answer")}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeField("faqs", index)}
                            disabled={formData.faqs.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addField("faqs")}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add FAQ
                      </Button>
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">SEO Settings</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("seo")}
                    >
                      {expandedSections.seo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </CardHeader>
                  {expandedSections.seo && (
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium">SEO Meta Title</Label>
                          <Input
                            type="text"
                            value={formData.seo.metaTitle}
                            onChange={(e) => {
                              const newFormData = { ...formData };
                              newFormData.seo.metaTitle = e.target.value;
                              setFormData(newFormData);
                            }}
                            placeholder="Enter SEO title (max 60 characters)"
                          />
                          {errors.metaTitle && <p className="text-red-500 text-sm">{errors.metaTitle}</p>}
                          <p className="text-sm text-gray-500">{formData.seo.metaTitle.length}/60</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">SEO Meta Description</Label>
                          <Input
                            type="text"
                            value={formData.seo.metaDescription}
                            onChange={(e) => {
                              const newFormData = { ...formData };
                              newFormData.seo.metaDescription = e.target.value;
                              setFormData(newFormData);
                            }}
                            placeholder="Enter SEO description (max 160 characters)"
                          />
                          {errors.metaDescription && <p className="text-red-500 text-sm">{errors.metaDescription}</p>}
                          <p className="text-sm text-gray-500">{formData.seo.metaDescription.length}/160</p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Subscription Offer</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("subscription")}
                    >
                      {expandedSections.subscription ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </CardHeader>
                  {expandedSections.subscription && (
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <Checkbox
                          checked={formData.subscriptionOffer.enabled}
                          onCheckedChange={(checked) => {
                            const newFormData = { ...formData };
                            newFormData.subscriptionOffer.enabled = checked;
                            setFormData(newFormData);
                          }}
                        />
                        <Label className="text-sm font-medium ml-2">Enable Subscription Offer</Label>
                      </div>
                      {formData.subscriptionOffer.enabled && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">First Order Discount (%)</Label>
                            <Input
                              type="number"
                              value={formData.subscriptionOffer.firstOrderDiscountPct}
                              onChange={(e) => {
                                const newFormData = { ...formData };
                                newFormData.subscriptionOffer.firstOrderDiscountPct = e.target.value;
                                setFormData(newFormData);
                              }}
                              placeholder="Enter discount percentage"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Recurring Discount (%)</Label>
                            <Input
                              type="number"
                              value={formData.subscriptionOffer.recurringDiscountPct}
                              onChange={(e) => {
                                const newFormData = { ...formData };
                                newFormData.subscriptionOffer.recurringDiscountPct = e.target.value;
                                setFormData(newFormData);
                              }}
                              placeholder="Enter recurring discount"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div className="flex items-center">
                            <Checkbox
                              checked={formData.subscriptionOffer.shippingInsured}
                              onCheckedChange={(checked) => {
                                const newFormData = { ...formData };
                                newFormData.subscriptionOffer.shippingInsured = checked;
                                setFormData(newFormData);
                              }}
                            />
                            <Label className="text-sm font-medium ml-2">Insured Shipping</Label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox
                              checked={formData.subscriptionOffer.cancelAnytime}
                              onCheckedChange={(checked) => {
                                const newFormData = { ...formData };
                                newFormData.subscriptionOffer.cancelAnytime = checked;
                                setFormData(newFormData);
                              }}
                            />
                            <Label className="text-sm font-medium ml-2">Cancel Anytime</Label>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                <div className="flex items-center">
                  <Checkbox
                    checked={formData.isActive}
                    onCheckedChange={(checked) => {
                      const newFormData = { ...formData };
                      newFormData.isActive = checked;
                      setFormData(newFormData);
                    }}
                  />
                  <Label className="text-sm font-medium ml-2">Product Active</Label>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => {
                      const newFormData = { ...formData };
                      newFormData.isFeatured = checked;
                      setFormData(newFormData);
                    }}
                  />
                  <Label className="text-sm font-medium ml-2">Featured Product</Label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onClose) onClose();
                    setFormData(initialFormData);
                    setImagePreviews([]);
                    if (typeof window !== "undefined") localStorage.removeItem("productFormData");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                >
                  {isSubmitting ? "Submitting..." : "Add Product"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              {renderPreview()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}