import { useState, useEffect } from "react";
import api from "@/lib/axios"; // your axios instance
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { mobileNumberSchema, optionalMobileNumberSchema } from "@/lib/validations/common";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: optionalMobileNumberSchema,
  role: z.string(),
  profilePicture:z.string()
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      profilePicture:"",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("garage_token");
        if (!token) {
          toast.error("Please login to view your profile");
          return;
        }
        const { data } = await api.get("/garage-users/profile");
        profileForm.reset({
          name: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
          profilePicture:data.profilePicture || "",
        });
        if (data.profilePicture) {
          setAvatar(`http://localhost:5000${data.profilePicture}`);
        } else {
          setAvatar(null);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("garage_token");
          window.location.href = "/login";
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to load profile. Please try again later.");
        }
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileForm]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    setUploading(true);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar(null);
    setSelectedFile(null);
  };

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("fullName", values.name);
      formData.append("email", values.email);
      if (values.phone) formData.append("phone", values.phone);

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      const { data } = await api.post("/garage-users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully!");
      profileForm.reset({
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role || values.role,
        profilePicture: data.profilePicture || values.profilePicture,

      });
      if (data.profilePicture) {
        setAvatar(`http://localhost:5000${data.profilePicture}`);
      } else {
        setAvatar(null);
      }
      setSelectedFile(null);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      const garageUser = localStorage.getItem("garage_user");
      if (!garageUser) {
        toast.error("User session not found. Please login again.");
        navigate("/login", { replace: true });
        return;
      }

      await api.put("/garage-users/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        _id: JSON.parse(garageUser).id,
      });

      // Show success message
      toast.success("Password changed successfully. Please login again.");

      // Clear form
      passwordForm.reset();

      // Clear auth data immediately
      localStorage.removeItem("garage_token");
      localStorage.removeItem("garage_user");

      // Navigate to login page
      navigate("/login", { replace: true });

    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("garage_token");
        localStorage.removeItem("garage_user");
        navigate("/login", { replace: true });
      } else {
        toast.error(err.response?.data?.message || "Password update failed");
      }
    }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-garage-blue text-white">
                      {profileForm
                        .getValues("name")
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className={`max-w-sm ${!isEditing ? 'hidden' : ''}`}
                      disabled={uploading || !isEditing}
                    />
                    <p className="text-sm text-muted-foreground">
                      {isEditing ? "JPG, GIF or PNG. Max size 2MB." : "Click Edit Profile to change your photo."}
                    </p>
                    {avatar && isEditing && (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={removeAvatar}
                        size="sm"
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4 max-w-md"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            profileForm.reset();
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={uploading}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Your email"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9876543210" 
                          {...field} 
                          disabled={!isEditing}
                          className={`${!isEditing ? "bg-muted" : ""} ${
                            profileForm.formState.errors.phone 
                              ? "border-red-500" 
                              : field.value && /^[6-9]\d{9}$/.test(field.value) 
                                ? "border-green-500" 
                                : ""
                          }`}
                          onChange={(e) => {
                            if (isEditing) {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4 max-w-md"
                  >
                    {["currentPassword", "newPassword", "confirmPassword"].map(
                      (field, idx) => (
                        <FormField
                          key={field}
                          control={passwordForm.control}
                          name={field as keyof PasswordFormValues}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>
                                {field === "currentPassword" &&
                                  "Current Password"}
                                {field === "newPassword" && "New Password"}
                                {field === "confirmPassword" &&
                                  "Confirm Password"}
                              </FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={
                                      showPassword[
                                        field as keyof typeof showPassword
                                      ]
                                        ? "text"
                                        : "password"
                                    }
                                    {...f}
                                    className="pr-10"
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="absolute top-1/2 right-2 -translate-y-1/2"
                                  onClick={() =>
                                    setShowPassword((prev) => ({
                                      ...prev,
                                      [field]:
                                        !prev[
                                          field as keyof typeof showPassword
                                        ],
                                    }))
                                  }
                                >
                                  {showPassword[
                                    field as keyof typeof showPassword
                                  ] ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    )}
                    <Button type="submit">Update Password</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Profile;
