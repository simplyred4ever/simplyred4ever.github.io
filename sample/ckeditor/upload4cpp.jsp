<%@page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java"%> 
<%@page import="java.io.*"%> 
<%@page import="java.util.Collection"%> 
<%@page import="javax.servlet.ServletException"%> 
<%@page import="javax.servlet.annotation.MultipartConfig"%> 
<%@page import="javax.servlet.annotation.WebServlet"%> 
<%@page import="javax.servlet.http.HttpServlet"%> 
<%@page import="javax.servlet.http.HttpServletRequest"%> 
<%@page import="javax.servlet.http.HttpServletResponse"%> 
<%@page import="javax.servlet.http.Part"%> 
<% 
/**获取上传文件的封装对象集合parts*/
Collection<Part>parts=request.getParts();
/**分别处理每一个part*/
for(Part part:parts){
	/**获取part名字*/
	String partName=part.getName();
	/**如果该名字等于file，c++是会把表单名文件字段的name设置成file的*/
	if(partName.equals("file")){
		/**获取content-disposition消息头，这里获取之后是一大串字符串，需要经过处理才能获取文件名*/
		String header = part.getHeader("content-disposition");
		/**用service获取文件名*/
		if(!header.contains("filename=\"\"")){
			StringBuilder sb=new StringBuilder(header);
			/**StringBuilder截取文件名，如果有更高效的方法请提供*/
			String fieldName = sb.delete(0, sb.indexOf("filename=\"")).substring(sb.indexOf("\"")+1, sb.lastIndexOf("\""));
			/**写入目标文件夹
			 * 要注意的是，如果不在开头写location，必须要写存放文件的文件夹的绝对路径，否则就只要
			 * 写文件名即可
			 *
			 */
			part.write(getServletContext().getRealPath("/") + "upload" + File.separator + fieldName + "_" + fieldName);

        }
 	}
}
%> 