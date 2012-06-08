package com.continuuity.gateway.accessor;

import com.continuuity.data.operation.Read;
import com.continuuity.gateway.util.NettyRestHandler;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;
import org.jboss.netty.handler.codec.http.QueryStringDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URLDecoder;

/**
 * This is the http request handler for the rest accessor. At this time it only accepts
 * GET requests to retrieve a value for a key from a named table.
 */
public class RestHandler extends NettyRestHandler {

	private static final Logger LOG = LoggerFactory
			.getLogger(RestHandler.class);

	/** The allowed methods for this handler */
	HttpMethod[] allowedMethods = { HttpMethod.GET };

	/**
	 * Will help validate URL paths, and also has the name of the connector and
	 * the data fabric executor.
	 */
	private RestAccessor accessor;

	/**
	 * All the paths have to be of the form http://host:port&lt;pathPrefix>&lt;table>/&lt;key>
	 * For instance, if config(prefix="/v0.1/" path="table/"), then pathPrefix will be
	 * "/v0.1/table/", and a valid request is GET http://host:port/v0.1/table/mytable/12345678
	 */
	private String pathPrefix;

	/** Disallow default constructor */
	private RestHandler() { }

	/**
	 * Constructor requires the accessor that created this
	 * @param accessor  the accessor that created this
	 */
	RestHandler(RestAccessor accessor) {
		this.accessor = accessor;
		this.pathPrefix = accessor.getHttpConfig().getPathPrefix() + accessor.getHttpConfig().getPathMiddle();
	}

	@Override
	public void messageReceived(ChannelHandlerContext context, MessageEvent message) throws Exception {
		HttpRequest request = (HttpRequest) message.getMessage();

		LOG.debug("Request received");

		// we only support get requests for now
		HttpMethod method = request.getMethod();
		if (method != HttpMethod.GET) {
			LOG.debug("Received a " + method + " request, which is not supported");
			respondNotAllowed(message.getChannel(), allowedMethods);
			return;
		}

		// we do not support a query or parameters in the URL
		QueryStringDecoder decoder = new QueryStringDecoder(request.getUri());
		if (decoder.getParameters() != null && !decoder.getParameters().isEmpty()) {
			LOG.debug("Received a request with query parameters, which is not supported");
			respondError(message.getChannel(), HttpResponseStatus.NOT_IMPLEMENTED);
			return;
		}

		// we only support requests of the form POST http://host:port/prefix/path/<tablename>/<key>
		String destination, key = null;
		String path = decoder.getPath();
		if (path.startsWith(this.pathPrefix)) {
			String remainder = path.substring(this.pathPrefix.length());
			int pos = remainder.indexOf("/");
			if (pos > 0) {
				destination = remainder.substring(0, pos);
				if ("default".equals(destination)) {
					key = remainder.substring(pos + 1);
				}
			}
		}
		if (key == null || key.length() == 0) {
			LOG.debug("Received a request with invalid path " + path);
			respondError(message.getChannel(), HttpResponseStatus.NOT_FOUND);
			return;
		}
		key = URLDecoder.decode(key, "ISO8859_1");
		LOG.debug("Received GET request for key '" + key + "'.");
		// ignore the content of the request - this is a GET
		// get the value from the data fabric
		byte[] value;
		try {
			Read read = new Read(key.getBytes("ISO8859_1"));
			value = this.accessor.getExecutor().execute(read);
		} catch (Exception e) {
			LOG.error("Error reading value for key '" + key + "': " + e.getMessage() + ".", e);
			respondError(message.getChannel(), HttpResponseStatus.INTERNAL_SERVER_ERROR);
			return;
		}
		if (value == null) {
			respondError(message.getChannel(), HttpResponseStatus.NOT_FOUND);
		} else {
			respondSuccess(message.getChannel(), request, value);
		}
	}

	@Override
	public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e)
			throws Exception {
		LOG.error("Exception caught for connector '" + this.accessor.getName() + "'. ", e.getCause());
		e.getChannel().close();
	}
}
