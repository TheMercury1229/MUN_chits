import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useCreateUser } from "../../hooks/useCreateUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export type FormDataType = {
  username: string;
  portfolio: string;
  role: string;
  committee: string;
  password: string;
};

const CreateEntries = () => {
  const [formData, setFormData] = useState<FormDataType>({
    username: "",
    portfolio: "",
    role: "",
    committee: "",
    password: "",
  });
  const [role, setRole] = useState("");
  const [committee, setCommittee] = useState("");
  const { createUser } = useCreateUser();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    createUser({ ...formData, role, committee });
    setLoading(false);
    setFormData({
      username: "",
      portfolio: "",
      role: "",
      committee: "",
      password: "",
    });
    setRole("");
    setCommittee("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-xl w-full mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Entries</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="username">Enter The Username</Label>
              <Input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password">Enter The Password</Label>
              <Input
                type="text"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="portfolio">Enter The Portfolio</Label>
              <Input
                type="text"
                name="portfolio"
                id="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="Portfolio"
              />
            </div>
            <div className="mb-4">
              <Label>Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EB">EB</SelectItem>
                  <SelectItem value="DELEGATE">Delegate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label>Select Committee</Label>
              <Select value={committee} onValueChange={setCommittee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Committee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIPPM">AIPPM</SelectItem>
                  <SelectItem value="UNHRC">UNHRC</SelectItem>
                  <SelectItem value="UNSC">UNSC</SelectItem>
                  <SelectItem value="UNCSW">UNCSW</SelectItem>
                  <SelectItem value="UNODC">UNODC</SelectItem>
                  <SelectItem value="ECOSOC">ECOSOC</SelectItem>
                  <SelectItem value="IP">IP</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={loading} className="w-full">
              {loading ? "Loading..." : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateEntries;
