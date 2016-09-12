<%@page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java"%> 
<%@page import="java.io.File"%> 
<%@page import="java.util.List"%> 
<%@page import="org.apache.commons.fileupload.*"%> 
<%@page import="org.apache.commons.fileupload.disk.DiskFileItemFactory"%> 
<%@page import="org.apache.commons.fileupload.servlet.ServletFileUpload"%> 
<% 
request.setCharacterEncoding("UTF-8"); 
// file less than 10kb will be store in memory, otherwise in file system. 
final int threshold = 10240; 
final File tmpDir = new File(getServletContext().getRealPath("/") + "upload" + File.separator + "tmp"); 
final int maxRequestSize = 1024 * 1024 * 4; // 4MB 
// Check that we have a file upload request 
if(ServletFileUpload.isMultipartContent(request)) { 
	// Create a factory for disk-based file items. 
	FileItemFactory factory = new DiskFileItemFactory(threshold, tmpDir); 
	
	// Create a new file upload handler 
	ServletFileUpload upload = new ServletFileUpload(factory); 
	// Set overall request size constraint. 
	upload.setSizeMax(maxRequestSize); 
	List<FileItem> items = upload.parseRequest(request); // FileUploadException 
	for(FileItem item : items)  { 
		if(item.isFormField()) { //regular form field 
		
			String name = item.getFieldName(); 
			String value = item.getString(); 
%> 
<h1><%=name%> --> <%=value%></h1> 
<% 
		}  else  { //file upload 
			String fieldName = item.getFieldName(); 
			String fileName = item.getName().replaceAll("^.*(/|\\\\)", "");
			File uploadedFile = new File(getServletContext().getRealPath("/") + 
			"upload" + File.separator + fieldName + "_" + fileName); 
			item.write(uploadedFile); 
%> 
<h1>upload file <%=uploadedFile.getName()%> done!</h1> 
<% 
		} 
	} 
} 
%> 