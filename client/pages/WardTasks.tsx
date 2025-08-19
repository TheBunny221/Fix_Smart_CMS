import React, { useState, useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import {
  useGetComplaintsQuery,
  useGetComplaintStatisticsQuery,
} from "../store/api/complaintsApi";
import { useGetWardTeamMembersQuery } from "../store/api/wardApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import ComplaintStatusUpdate from "../components/ComplaintStatusUpdate";
import ComplaintDetailsModal from "../components/ComplaintDetailsModal";
import {
  CheckSquare,
  Calendar,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  Eye,
  Edit3,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  FileText,
} from "lucide-react";

const WardTasks: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  // State for modals and filters
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [updateMode, setUpdateMode] = useState<"status" | "assign" | "both">("both");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch complaints for the ward officer's ward (backend auto-filters)
  const {
    data: complaintsResponse,
    isLoading: complaintsLoading,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useGetComplaintsQuery({
    page: 1,
    limit: 100,
  });

  // Fetch complaint statistics
  const { data: statsResponse, isLoading: statsLoading } =
    useGetComplaintStatisticsQuery({});

  // Fetch team members for assignment
  const { data: teamResponse, isLoading: teamLoading } =
    useGetWardTeamMembersQuery(user?.wardId || "", {
      skip: !user?.wardId,
    });

  const complaints = Array.isArray(complaintsResponse?.data) ? complaintsResponse.data : [];
  const teamMembers = teamResponse?.data?.teamMembers || [];

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    if (!Array.isArray(complaints)) {
      return {
        totalTasks: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        assigned: 0,
        unassigned: 0,
      };
    }

    const totalTasks = complaints.length;
    const pending = complaints.filter((c) => c.status === "REGISTERED").length;
    const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
    const completed = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
    const assigned = complaints.filter((c) => c.assignedToId).length;
    const unassigned = complaints.filter((c) => !c.assignedToId).length;

    return {
      totalTasks,
      pending,
      inProgress,
      completed,
      assigned,
      unassigned,
    };
  }, [complaints]);

  // Filter complaints based on search and filters
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch = !searchTerm || 
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter]);

  // Group complaints by status for tabs
  const complaintsByStatus = useMemo(() => {
    return {
      all: filteredComplaints,
      pending: filteredComplaints.filter((c) => c.status === "REGISTERED"),
      assigned: filteredComplaints.filter((c) => c.status === "ASSIGNED"),
      inProgress: filteredComplaints.filter((c) => c.status === "IN_PROGRESS"),
      completed: filteredComplaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED"),
    };
  }, [filteredComplaints]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "REGISTERED":
        return "bg-yellow-100 text-yellow-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateStatus = (complaint: any, mode: "status" | "assign" | "both" = "both") => {
    setSelectedComplaint(complaint);
    setUpdateMode(mode);
    setUpdateModalOpen(true);
  };

  const handleViewDetails = (complaint: any) => {
    setSelectedComplaint(complaint);
    setDetailsModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    refetchComplaints();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAssigneeInfo = (complaint: any) => {
    if (complaint.assignedTo) {
      return complaint.assignedTo.fullName || complaint.assignedTo.name || "Assigned";
    }
    return "Unassigned";
  };

  const renderComplaintCard = (complaint: any) => (
    <div
      key={complaint.id}
      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-base mb-1">
            #{complaint.complaintId || complaint.id.slice(-6)} - {complaint.type?.replace("_", " ")}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {complaint.description}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2 ml-4">
          <div className="flex space-x-1">
            <Badge className={getPriorityColor(complaint.priority)}>
              {complaint.priority}
            </Badge>
            <Badge className={getStatusColor(complaint.status)}>
              {complaint.status?.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{getAssigneeInfo(complaint)}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{complaint.area}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Submitted: {formatDate(complaint.submittedOn || complaint.createdAt)}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(complaint)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateStatus(complaint, "status")}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Update Status
        </Button>
        <Button
          size="sm"
          onClick={() => handleUpdateStatus(complaint, "assign")}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Assign
        </Button>
      </div>
    </div>
  );

  if (complaintsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading ward tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ward Tasks</h1>
          <p className="text-gray-600">
            Manage and track complaints assigned to your ward
          </p>
        </div>
        <Button onClick={() => refetchComplaints()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{dashboardStats.totalTasks}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.inProgress}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{dashboardStats.completed}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardStats.assigned}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-red-600">{dashboardStats.unassigned}</p>
              </div>
              <UserPlus className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="REGISTERED">Registered</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({complaintsByStatus.all.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({complaintsByStatus.pending.length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned ({complaintsByStatus.assigned.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress">
            In Progress ({complaintsByStatus.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({complaintsByStatus.completed.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(complaintsByStatus).map(([key, complaints]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">
                  {key === "inProgress" ? "In Progress" : key} Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {complaints.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      No {key === "all" ? "" : key} tasks found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map(renderComplaintCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Status Update Modal */}
      {selectedComplaint && (
        <ComplaintStatusUpdate
          complaint={selectedComplaint}
          isOpen={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedComplaint(null);
          }}
          onSuccess={handleUpdateSuccess}
          mode={updateMode}
        />
      )}

      {/* Details Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedComplaint(null);
          }}
          complaint={selectedComplaint}
        />
      )}
    </div>
  );
};

export default WardTasks;
