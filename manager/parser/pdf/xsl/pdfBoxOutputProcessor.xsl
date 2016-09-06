<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:saxon="http://saxon.sf.net/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0" extension-element-prefixes="saxon">

    <xsl:output omit-xml-declaration="yes" indent="yes"/>
    
    <xsl:variable name="i" select="0" saxon:assignable="yes"/>
    <xsl:variable name="d" select="0" saxon:assignable="yes"/>
    
    <xsl:template match="/">
        <document>
            <xsl:apply-templates/>
        </document>
    </xsl:template>
    
    <xsl:template match="div[@style='page-break-before:always; page-break-after:always']">
        <div class="page">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    
    <xsl:template match="b">
        <xsl:copy>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="p"/>
    <xsl:template match="p[not(text()='AH Formatter V6.3 MR1  http://www.antennahouse.com/')]">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="text()">
        <xsl:if test="normalize-space()!=''">
            <xsl:for-each select="tokenize(., '\n\r?')[.]">
                <xsl:variable name="newi" select="$i+1"/>
                <xsl:choose>
                    <xsl:when test="concat('', $newi)=substring(.,string-length(.)-$d)">
                        <saxon:assign name="i" select="$i+1"/>
                        <line number="{substring(.,string-length(.)-$d)}"><xsl:value-of select="substring(.,0,string-length(.)-$d)"></xsl:value-of></line>
                        <xsl:if test="$i=9 or $i=99 or $i=999 or $i=9999 or $i=99999">
                            <saxon:assign name="d" select="$d+1"/>
                        </xsl:if>        
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="."/>
                    </xsl:otherwise>
                </xsl:choose>                    
            </xsl:for-each>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
