<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns="http://xml.house.gov/schemas/uslm/1.0"
    version="2.0" >
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Aug 8, 2016</xd:p>
            <xd:p><xd:b>Author:</xd:b> arevalo</xd:p>
            <xd:p></xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <xsl:choose>
            <xsl:when test="*/@itemtype='usbill'">
                <bill>
                    <meta></meta>
                    <main>
                        <xsl:apply-templates select="*/*[@itemtype='section']"/>
                    </main>
                </bill>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="p[child::span[@itemtype='enum']]" priority="1">
        <xsl:choose>
            <xsl:when test="@itemtype='section' or @itemtype='subsection' or @itemtype='paragraph' or @itemtype='subparagraph'">
                <xsl:element name="{@itemtype}">
                    <num><xsl:apply-templates select="span[@itemtype='enum']"/></num>
                    <heading><xsl:apply-templates select="span[@itemtype='header']"/></heading>
                    <xsl:apply-templates select="span[@itemtype='text']"/>
                    <xsl:variable name="section" select="."/>
                    <xsl:for-each select="tokenize(@itemref,' ')">
                        <xsl:variable name="itemRef" select="."/>
                        <xsl:apply-templates select="$section/following-sibling::p[@id=$itemRef]"/>    
                    </xsl:for-each>
                    
                </xsl:element>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="p[@itemtype='section']">
        <xsl:apply-templates select="*"/>
    </xsl:template>
    <xsl:template match="span[@itemtype='text']" priority="1">
        <text>
            <p>
                <xsl:apply-templates/>
            </p>
        </text>
    </xsl:template>
    <xsl:template match="*[@itemtype='enum']">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="*[@itemtype='header']">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="*[@itemtype='text']">
        <content>
            <xsl:apply-templates/>
        </content>
    </xsl:template>
    <xsl:template match="span|p"/>
</xsl:stylesheet>
