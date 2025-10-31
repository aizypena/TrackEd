import {
  MdClose,
  MdPerson,
  MdPhone,
  MdSchool,
  MdAssignment,
  MdDescription,
  MdEdit,
  MdPrint,
  MdPayment,
  MdCheckCircle,
  MdPending,
  MdWarning
} from 'react-icons/md';

const StudentDetailModal = ({ student, onClose, getStatusBadge, getPaymentBadge }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="bg-tracked-primary p-6 text-white sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                <MdPerson className="h-12 w-12 text-tracked-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {student.firstName} {student.middleName} {student.lastName}
                </h2>
                <p className="text-blue-100">{student.studentId}</p>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(student.enrollmentStatus)}
                  {getPaymentBadge(student.paymentStatus)}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:cursor-pointer hover:bg-opacity-20 rounded-full p-2"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MdPerson className="h-5 w-5 text-tracked-primary" />
                Personal Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">
                    {student.firstName} {student.middleName} {student.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-800">{student.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="font-medium text-gray-800">{student.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{student.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{student.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium text-gray-800">{student.address}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MdPhone className="h-5 w-5 text-tracked-primary" />
                Emergency Contact
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Contact Name</p>
                  <p className="font-medium text-gray-800">{student.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Relationship</p>
                  <p className="font-medium text-gray-800">{student.emergencyContact.relationship}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-800">{student.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MdSchool className="h-5 w-5 text-tracked-primary" />
                Enrollment Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Program</p>
                  <p className="font-medium text-gray-800">{student.program}</p>
                </div>
                <div>
                  <p className="text-gray-500">Batch</p>
                  <p className="font-medium text-gray-800">{student.batch}</p>
                </div>
                <div>
                  <p className="text-gray-500">Enrollment Date</p>
                  <p className="font-medium text-gray-800">{student.enrollmentDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expected Graduation</p>
                  <p className="font-medium text-gray-800">{student.expectedGraduation}</p>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MdAssignment className="h-5 w-5 text-tracked-primary" />
                Academic Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="text-2xl font-bold text-tracked-primary">{student.attendance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-tracked-primary h-2 rounded-full" 
                    style={{ width: `${student.attendance}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">Overall Grade</span>
                  <span className="text-2xl font-bold text-tracked-secondary">{student.overallGrade}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-tracked-secondary h-2 rounded-full" 
                    style={{ width: `${student.overallGrade}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MdDescription className="h-5 w-5 text-tracked-primary" />
                Submitted Documents
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {student.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                    <MdCheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
