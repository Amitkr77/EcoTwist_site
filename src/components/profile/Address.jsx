import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { MapPin, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/store/slices/userSlice";
import EditAddressDialog from "@/components/profile/components/EditAddressDialog"; // Import the new dialog component

export default function Address({ addresses, isLoading = false, user }) {
  const dispatch = useDispatch();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State for edit dialog
  const [selectedAddress, setSelectedAddress] = useState(null); // Track address to edit

  const validateAddress = () => {
    const errors = {};
    if (!newAddress.fullName) errors.fullName = "Full name is required";
    if (!newAddress.phone) errors.phone = "Phone number is required";
    if (!newAddress.street) errors.street = "Street is required";
    if (!newAddress.city) errors.city = "City is required";
    if (!newAddress.state) errors.state = "State is required";
    if (!newAddress.postalCode) errors.postalCode = "Postal code is required";
    if (!newAddress.country) errors.country = "Country is required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = () => {
    if (validateAddress()) {
      dispatch(addAddress(newAddress))
        .unwrap()
        .then(() => {
          toast.success("Address added successfully");
          setNewAddress({
            fullName: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            isDefault: false,
          });
          setIsAddingAddress(false);
        })
        .catch((err) => toast.error(err.message || "Failed to add address"));
    }
  };

  const handleDeleteAddress = (id) => {
    dispatch(deleteAddress(id))
      .unwrap()
      .then(() => toast.success("Address deleted successfully"))
      .catch((err) => toast.error(err.message || "Failed to delete address"));
  };

  const handleSetDefaultAddress = (id) => {
    dispatch(setDefaultAddress(id))
      .unwrap()
      .then(() => toast.success("Default address set successfully"))
      .catch((err) =>
        toast.error(err.message || "Failed to set default address")
      );
  };

  const handleEditAddress = (addr) => {
    setSelectedAddress(addr); // Set the address to edit
    setIsEditDialogOpen(true); // Open the edit dialog
  };

  return (
    <section>
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 sm:space-y-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-20 sm:h-24" />
              ))}
            </div>
          ) : addresses.length === 0 && !isAddingAddress ? (
            <div className="flex justify-center items-center flex-col gap-2 p-6 sm:p-10 bg-gray-100 rounded-lg sm:rounded-xl">
              <MapPin size={32} className="sm:h-10 sm:w-10" />
              <h1 className="text-base sm:text-lg">No addresses saved</h1>
              <Button
                onClick={() => setIsAddingAddress(true)}
                className="text-sm sm:text-base"
              >
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {addresses.map((addr) => (
                <Card
                  key={addr._id || addr.id}
                  className="relative overflow-hidden"
                >
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start">
                      <div className="relative bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div
                          className="absolute inset-0 rounded-lg border-2 border-transparent"
                          style={{
                            borderImage:
                              "linear-gradient(to right, transparent, #5eead4, transparent) 1",
                          }}
                        />
                        <div className="relative space-y-5 w-96">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Name
                              </span>
                              <h3 className="text-2xl font-bold text-gray-900 font-['Poppins',sans-serif] leading-tight">
                                {addr.fullName || user.fullName}
                              </h3>
                            </div>
                            {addr.isDefault && (
                              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-teal-600 bg-teal-50 rounded-md">
                                Default
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                              Address
                            </span>
                            <p className="text-base text-gray-800 font-['Poppins',sans-serif] leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state}{" "}
                              {addr.postalCode}, {addr.country}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                              Phone
                            </span>
                            <p className="text-base text-gray-800 font-['Poppins',sans-serif] leading-relaxed">
                              {addr.phone || user.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(addr)} // Open edit dialog
                        >
                          Edit
                        </Button>
                        {!addr.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(addr._id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Address?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this address?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAddress(addr._id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isAddingAddress ? (
            <Button
              className="mt-4 sm:mt-6 text-sm sm:text-base"
              onClick={() => setIsAddingAddress(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add New Address
            </Button>
          ) : (
            <Card className="mt-4 sm:mt-6">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Add New Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Full Name</Label>
                    <Input
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          fullName: e.target.value,
                        })
                      }
                      className="mt-1 text-sm sm:text-base"
                      aria-label="Full Name"
                    />
                    {addressErrors.fullName && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {addressErrors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">Phone</Label>
                    <Input
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          phone: e.target.value,
                        })
                      }
                      className="mt-1 text-sm sm:text-base"
                      aria-label="Phone"
                    />
                    {addressErrors.phone && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {addressErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">Street</Label>
                    <Input
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          street: e.target.value,
                        })
                      }
                      className="mt-1 text-sm sm:text-base"
                      aria-label="Street"
                    />
                    {addressErrors.street && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {addressErrors.street}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">City</Label>
                    <Input
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          city: e.target.value,
                        })
                      }
                      className="mt-1 text-sm sm:text-base"
                      aria-label="City"
                    />
                    {addressErrors.city && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {addressErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">State</Label>
                    <Input
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          state: e.target.value,
                        })
                      }
                      className="mt-1 text-sm sm:text-base"
                      aria-label="State"
                    />
                    {addressErrors.state && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {addressErrors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">Postal Code</Label>
                    <Input
                      value={newAddress.postalCode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          postalCode: e.target.value,
                        })
                      }
                      className="mt-1 text-sm sm:text-base"
                      aria-label="Postal Code"
                    />
                    {addressErrors.postalCode && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {addressErrors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">Country</Label>
                    <Input
                      value={newAddress.country}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          country: e.target.value,
                        })
                      }
                      className="mt-1 text-sm sm:text-base"
                      aria-label="Country"
                    />
                    {addressErrors.country && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {addressErrors.country}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onCheckedChange={(checked) =>
                        setNewAddress({
                          ...newAddress,
                          isDefault: checked,
                        })
                      }
                    />
                    <Label htmlFor="isDefault" className="text-sm">
                      Set as Default
                    </Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleAddAddress}
                      className="text-sm sm:text-base"
                    >
                      Save Address
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingAddress(false)}
                      className="text-sm sm:text-base"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <EditAddressDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        address={selectedAddress}
        user={user}
      />
    </section>
  );
}
