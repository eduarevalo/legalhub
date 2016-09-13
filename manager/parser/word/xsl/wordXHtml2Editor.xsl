<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"    
    exclude-result-prefixes="xs" version="2.0">
    <xsl:template match="xhtml:p| xhtml:span">
        <xsl:element name="{local-name()}">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="xhtml:p[@class='MsoCommentText']"/>
    <xsl:template match="xhtml:img">
        <xsl:element name="{local-name()}">
            <xsl:copy-of select="@*|text()"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="/">
        <div>
            <xsl:apply-templates select="//xhtml:body"/>
        </div>
    </xsl:template>
    <xsl:template match="*">
        <xsl:apply-templates/>
    </xsl:template>
</xsl:stylesheet>