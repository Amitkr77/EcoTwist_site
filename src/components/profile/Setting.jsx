import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import ChangePassword from "../ChangePassword";
import { updateAccountInfo } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";


export default function Setting({ data, profileData }) {
   const dispatch = useDispatch();
  const profile = profileData;

  const [userInfo, setUserInfo] = useState(data);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleEditProfileToggle = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const handleProfileInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    dispatch(updateAccountInfo(userInfo))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully");
        setIsEditingProfile(false);
      })
      .catch((err) => toast.error(err || "Failed to update profile"));
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="mb-4 sm:mb-6 flex-wrap">
            <TabsTrigger value="preferences" className="text-sm sm:text-base">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="account" className="text-sm sm:text-base">
              Account
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preferences">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm sm:text-base">
                  Email Notifications
                </span>
                <Switch />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm sm:text-base">
                  SMS Notifications
                </span>
                <Switch />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm sm:text-base">
                  Push Notifications
                </span>
                <Switch />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="account">
            <div className="space-y-4 sm:space-y-6">
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Account Information
                  </h2>
                  {!isEditingProfile ? (
                    <Button
                      variant="outline"
                      onClick={handleEditProfileToggle}
                      className="mt-2 sm:mt-0"
                    >
                      <Edit className="w-4 h-4 mr-2" /> Update
                    </Button>
                  ) : (
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        onClick={handleEditProfileToggle}
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" /> Save
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        name="fullName"
                        value={userInfo.fullName}
                        onChange={handleProfileInputChange}
                        className="mt-1 text-sm sm:text-base"
                        aria-label="Full Name"
                      />
                    ) : (
                      <p className="mt-1 text-gray-600 text-sm sm:text-base">
                        {userInfo.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        name="email"
                        value={userInfo.email}
                        onChange={handleProfileInputChange}
                        className="mt-1 text-sm sm:text-base"
                        aria-label="Email Address"
                      />
                    ) : (
                      <p className="mt-1 text-gray-600 text-sm sm:text-base">
                        {userInfo.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        name="phone"
                        value={userInfo.phone}
                        onChange={handleProfileInputChange}
                        className="mt-1 text-sm sm:text-base"
                        aria-label="Phone Number"
                      />
                    ) : (
                      <p className="mt-1 text-gray-600 text-sm sm:text-base">
                        {userInfo.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Joined On
                    </Label>
                    <p className="mt-1 text-gray-600 text-sm sm:text-base">
                      {new Date(profile?.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </>

              <div className="flex gap-2 items-center mt-10">
                <ChangePassword />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-1/5 justify-start text-sm sm:text-base"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Are you sure?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          toast.success("Account deletion requested");
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
