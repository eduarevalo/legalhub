<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:saxon="http://saxon.sf.net/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0" extension-element-prefixes="saxon">
    
    <xsl:variable name="lineNumbersFile" select="document('file:///C:\Users\arevalo\AppData\Local\Temp/6a55dc03-9e30-50cb-a98d-49cd2f0664a6')"/>
    
    <xsl:variable name="newText" saxon:assignable="yes"/>
    
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="text()">
        <saxon:assign name="newText">
            <xsl:copy-of select="."/>
        </saxon:assign>
        <xsl:for-each select="$lineNumbersFile//line">
            <xsl:if test="contains($newText, text())">
                <saxon:assign name="newText" >
                    <xsl:value-of disable-output-escaping="yes" select="replace($newText, ., concat('&lt;a number=&quot;', @number, '&quot;/>', text()))"/>
                </saxon:assign>
            </xsl:if>
        </xsl:for-each>
        <xsl:copy-of select="$newText"/>
    </xsl:template>
    
</xsl:stylesheet>
